# WebSockets and Real Time Communication

This demo app is split into two parts, a React app as our client, and a node socket server.

## [`app`](./app)

This folder contains a React application built using `create-react-app`.

## [`server`](./server)

This folder contains our WebSocket server.

### Socket Messages

#### Sent Message

The structure of the Sent Message socket message is as follows:

```js
{
  type: 'message',
  data: {
    id: Number,
    text: String
  }
}
```

#### Change Background

The structure of the Change Background message is as follows:

```js
{
  type: 'setBackground',
  backgroundColor: String
}
```
