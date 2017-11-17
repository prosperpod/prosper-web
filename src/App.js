import React, {Component} from 'react';
import './App.css';
import Configuration from './shared/Configuration';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      input: {
        value: "",
      },
      console: {
        elements: [],
        prefixes: {
          usr: "&!:",
          sys: "$:",
        }
      },
      socket: {
        open: false,
      },
    }
  }

  componentDidMount() {
    this.socket = new WebSocket(Configuration.serverSocketAddress);
    this.socket.addEventListener('open', (event) => {
      this.socket.send("connection-did-open");
      this.setState((state) => {
        state.socket.open = true;
        return state;
      });
    });
    this.socket.addEventListener('message', (event) => {
      this.handleServerMessage(event.data);
    });
    this.socket.addEventListener('error', (event) => {
      this.handleSocketError(event);
    });
    this.socket.addEventListener('close', (event) => {
      console.log(event);
      this.addConsoleElement("sys", "Socket connection closed" +
          (event.reason ? (": " + event.reason) : ", reason unknown."), "Alert:")
      this.setState((state) => {
        state.socket.open = false;
        return state;
      });
    });
  }

  handleServerMessage(msg) {
    try {
      const json = JSON.parse(msg);
      if (json.hasOwnProperty("messages")) {
        json.messages.forEach((message) => {
          this.addConsoleElement("sys", message, json.prefix);
        });
      } else if (json.hasOwnProperty("message")) {
        this.addConsoleElement("sys", json.message, json.prefix);
      }

      if (json.hasOwnProperty("console-command")) {
        const command = json["console-command"];
        if (command === "clear-console") {
          this.clearConsole();
        }
      }
    } catch (err) {
      if (err.name === "SyntaxError") {
        this.addConsoleElement("sys", msg);
      } else {
        throw err;
      }
    }
  }

  handleSocketError(event) {
    this.addConsoleElement("sys", "A socket error occurred...", "Error:");
  }

  handleInputChange(event) {
    const input = event.target.value;
    this.setState((state) => {
      state.input.value = input;
      return state;
    })
  }

  handleInputSubmit(event) {
    event.preventDefault();
    const message = this.state.input.value;
    this.addConsoleElement("usr", message);
    this.sendSocketMessage(message);
    this.setState((state) => {
      state.input.value = "";
      return state;
    });
  }

  sendSocketMessage(msg) {
    if (this.state.socket.open) {
      this.socket.send(msg);
    } else {
      this.addConsoleElement("sys", "Socket connection could not be made, no communication" +
          " possible.", "Warning:");
    }
  }

  clearConsole() {
    this.setState((state) => {
      state.console.elements = [];
      return state;
    })
  }

  addConsoleElement(src, msg, prefix) {
    if (prefix == null) {
      if (src === "usr") {
        prefix = this.state.console.prefixes.usr;
      } else {
        prefix = this.state.console.prefixes.sys;
      }
    }

    this.setState((state) => {
      if (state.console.elements.length === 0) {
        state.console.elements = [{id: 1, src: src, msg: msg, prefix: prefix}];
      } else {
        const id = state.console.elements[0].id + 1;
        state.console.elements.unshift({id: id, src: src, msg: msg, prefix: prefix});
        if (state.console.elements.length > 300) {
          state.console.elements = state.console.elements.slice(0, 300);
        }
      }
      return state;
    });
  }

  constructConsoleData() {
    const elems = this.state.console.elements;
    return elems.map(elem =>
        <li key={elem.id} className={elem.src}>
          <p className={"prefix"}>{elem.prefix}</p>
          <p className={"message"}>{elem.msg}</p>
        </li>
    );
  }

  render() {
    return (
        <div className="root">
          <div className={"top-bar"}>
            <form onSubmit={this.handleInputSubmit.bind(this)}>
              <input className="top-bar-input" type="text" value={this.state.input.value}
                     placeholder={"prosper-pod-1.0"} onChange={this.handleInputChange.bind(this)}/>
            </form>
          </div>
          <div className={"console"}>
            <ul>
              {this.constructConsoleData()}
            </ul>
          </div>
        </div>
    );
  }
}