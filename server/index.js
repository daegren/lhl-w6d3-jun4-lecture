const express = require("express");
const WebSocket = require("ws");
const http = require("http");

const app = express();

app.get("/", (req, res) => {
  res.send("Hello!");
});

const server = http.createServer(app);

const socketServer = new WebSocket.Server({ server, path: "/websocket" });

socketServer.broadcast = (data, ws) => {
  socketServer.clients.forEach(client => {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

let id = 1;
let backgroundColor = "red";

const createMessage = text => ({
  type: "message",
  data: {
    id: id++,
    text
  }
});

const backgroundMessage = () => ({
  type: "setBackground",
  backgroundColor
});

socketServer.on("connection", ws => {
  console.log("Client connected");
  const initialMessage = backgroundMessage();
  ws.send(JSON.stringify(initialMessage));

  ws.on("message", data => {
    console.log("Got message", data);

    const msg = JSON.parse(data);

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

server.listen(8080, () => {
  console.log("Socket server is listening on ws://localhost:8080");
});
