import React, {Component} from 'react';
import './App.css';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      input: {
        value: "",
      },
      console: {
        elements: [],
      },
      modePrefix: "testing",
    }
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
    this.addConsoleElement("usr", this.state.input.value);
    this.setState((state) => {
      state.input.value = "";
      return state;
    });
  }

  clearConsole() {
    this.setState((state) => {
      state.console.elements = [];
      return state;
    })
  }

  addConsoleElement(src, msg) {
    this.setState((state) => {
      if (state.console.elements.length === 0) {
        state.console.elements = [{id: 1, src: src, msg: msg}];
      } else {
        const id = state.console.elements[0].id + 1;
        state.console.elements.unshift({id: id, src: src, msg: msg});
        if (state.console.elements.length > 300) {
          state.console.elements = state.console.elements.slice(0, 300);
        }
      }
    });
  }

  constructConsoleData() {
    const elems = this.state.console.elements;
    return elems.map(elem =>
        <li key={elem.id} className={elem.src}>
          <p className={"prefix"}>{this.state.modePrefix}</p>
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