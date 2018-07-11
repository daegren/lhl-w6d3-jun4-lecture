import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";

const mess = {
  id: 1,
  text: "This is the text"
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      message: "",
      allMessages: [],
      backgroundColor: "white"
    };
  }

  componentDidMount() {
    // Setup the WebSocket client
    this.socket = new WebSocket("ws://localhost:8080/websocket");

    // Handle when the socket opens (i.e. is connected to the server)
    this.socket.addEventListener("open", e => {
      console.log("Connected to websocket server");
    });

    // Handle messages using `this.receiveMessage`
    this.socket.addEventListener("message", this.receiveMessage);
  }

  // Event handler for messages being received from the Socket server.
  receiveMessage = e => {
    const msg = JSON.parse(e.data);

    switch (msg.type) {
      case "message":
        this.setState(prevState => ({
          ...prevState,
          allMessages: prevState.allMessages.concat(msg.data)
        }));
        break;
      case "setBackground":
        this.setState({ backgroundColor: msg.backgroundColor });
        break;
      default:
    }
  };

  // Change event handler for the controlled message input
  updateMessage = e => {
    this.setState({ message: e.target.value });
  };

  // KeyPress event handler for the controlled message input
  sendMessage = e => {
    if (e.key === "Enter") {
      const msg = {
        type: "message",
        text: this.state.message
      };
      this.socket.send(JSON.stringify(msg));
      this.setState({ message: "" });
    }
  };

  // Change event handler for the background color select.
  changeBackground = e => {
    this.setState({ backgroundColor: e.target.value }, () => {
      const message = {
        type: "setBackground",
        backgroundColor: this.state.backgroundColor
      };

      this.socket.send(JSON.stringify(message));
    });
  };

  render() {
    return (
      <div
        className="App"
        style={{ backgroundColor: this.state.backgroundColor }}
      >
        <h1>Hello React</h1>

        <div>
          <div>
            <label>Message:</label>
            <input
              value={this.state.message}
              onChange={this.updateMessage}
              onKeyPress={this.sendMessage}
            />
          </div>
          <div>
            <label>Set Color</label>
            <select
              value={this.state.backgroundColor}
              onChange={this.changeBackground}
            >
              <option value="white">White</option>
              <option value="red">Red</option>
              <option value="blue">Blue</option>
              <option value="green">Green</option>
            </select>
          </div>
        </div>

        <div>
          {this.state.allMessages.map(m => <div key={m.id}>{m.text}</div>)}
        </div>
      </div>
    );
  }
}

export default App;
