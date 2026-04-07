# EventFlow Client

Free and lightweight realtime WebSocket client for building event-driven applications.

## 🚀 Installation

```bash
npm install eventflow-client
```

---

## ⚡ Quick Start

```js
import EventFlow from 'eventflow-client'

const client = new EventFlow('your-app-key', {
  debug: true
})

const channel = client.subscribe('test-channel')

channel.on('hello', (data) => {
  console.log('Received:', data)
})

channel.trigger('hello', { text: 'Hello world' })
```

---

## ✨ Features

* ⚡ Realtime communication via WebSocket
* 🧩 Channel-based architecture
* 🔁 Automatic reconnection
* 🪶 Lightweight and fast
* 🆓 Completely free to use
* 🔧 Easy integration

---

## 📦 API

### `new EventFlow(appKey, options)`

Create a new client instance.

* `appKey` (string) — your application key
* `options.host` (string) — WebSocket server URL
* `options.debug` (boolean) — enable debug logs

---

### `client.subscribe(channelName)`

Subscribe to a channel.

```js
const channel = client.subscribe('chat')
```

---

### `channel.on(event, callback)`

Listen for events.

```js
channel.on('message', (data) => {
  console.log(data)
})
```

---

### `channel.trigger(event, data)`

Send event to channel.

```js
channel.trigger('message', { text: 'Hi' })
```

---

### `channel.off(event)`

Remove event listener.

---

### `client.disconnect()`

Disconnect from server.

---

## 📁 Example

See the `/example` folder for a working demo.

---

## 📄 License

MIT
