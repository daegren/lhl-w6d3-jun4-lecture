const express = require("express");
const WebSocket = require("ws");
const http = require("http");

// Create an express app
const app = express();

// Basic express route
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Create an HTTP server from our Express server to use with WebSocket.Server
const server = http.createServer(app);

// Create our Socket Server.
const socketServer = new WebSocket.Server({ server, path: "/websocket" });

/**
 * Broadcast a message to all connected clients. If you pass a client as the second parameter, it will not send to that client.
 * @param  {String} data The data to send to all clients.
 * @param  {WebSocket} ws  Optional. The sending socket, to prevent sending data back to the client that we got the initial message from.
 */
socketServer.broadcast = (data, ws) => {
  socketServer.clients.forEach(client => {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

// Use some global variables to hold on to some data used by the server
let id = 1;
let backgroundColor = "red";

// Message creators

/**
 * Create the object used to represent a `message` message.
 * @param  {String} text The text of the message.
 * @return {Object}      The `message` object to send over the socket.
 */
const createMessage = text => ({
  type: "message",
  data: {
    id: id++,
    text
  }
});

/**
 * Create the object used to represent a `setBackground` message.
 * @return {Object} The `setBackground` message to send over the socket.
 */
const backgroundMessage = () => ({
  type: "setBackground",
  backgroundColor
});

// Event handler for when a client connects to the socket server.
socketServer.on("connection", ws => {
  console.log("Client connected");
  // When first connected send the client the current background color.
  const initialMessage = backgroundMessage();
  ws.send(JSON.stringify(initialMessage));

  // Event handler for when a client sends the server a message.
  ws.on("message", data => {
    console.log("Got message", data);

    const msg = JSON.parse(data);

    // Switching on the message's type to handle the right action.
    switch (msg.type) {
      case "message":
        const message = createMessage(msg.text);

        socketServer.broadcast(JSON.stringify(message));
        break;
      case "setBackground":
        backgroundColor = msg.backgroundColor;
        const data = JSON.stringify(backgroundMessage());

        socketServer.broadcast(data, ws);
        break;
      default:
    }
  });
});

// Start the HTTP server (not the express server)
server.listen(8080, () => {
  console.log("Socket server is listening on ws://localhost:8080");
});
