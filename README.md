# ⚡ EventFlow Client

**Free, lightweight real-time WebSocket client for building event-driven applications.**

> **100% Free Forever** — no credit card, no trial limits. Get your free App Key at **[evnt-flow.com](https://evnt-flow.com)** and start streaming events in minutes.

[![npm](https://img.shields.io/npm/v/eventflow-client)](https://www.npmjs.com/package/eventflow-client)
[![license](https://img.shields.io/npm/l/eventflow-client)](LICENSE)

---

## 🚀 Installation

```bash
npm install eventflow-client
```

---

## 🔑 Get Your Free App Key

1. Go to **[evnt-flow.com](https://evnt-flow.com)**
2. Create a free account
3. Copy your **App Key** from the dashboard
4. Use it in the code below — that's it!

---

## ⚡ Quick Start

```js
import EventFlow from 'eventflow-client'

const ef = new EventFlow('YOUR_APP_KEY')
const channel = ef.subscribe('my-channel')

// Listen for incoming messages from OTHER clients
// Note: sender does NOT receive their own messages
channel.on('my-event', (data) => {
  console.log('Received:', data)
})

// Send a message — other subscribers will receive it
channel.trigger('my-event', { message: 'hello world' })
```

> **⚠️ Important:** The sender does **not** receive their own messages. Only other subscribers on the same channel will receive them. To test, open two browser tabs or run two Node.js processes.

---

## 🌐 Browser Usage

```html
<script src="https://cdn.socket.io/4.8.1/socket.io.min.js"></script>
<script src="https://cdn.evnt-flow.com/eventflow.min.js"></script>

<script>
const ef = new EventFlow('YOUR_APP_KEY')
const channel = ef.subscribe('my-channel')

channel.on('my-event', (data) => {
  console.log('Received:', data)
})

channel.trigger('my-event', { message: 'hello world' })
</script>
```

---

## ✨ Features

| | Feature |
|---|---|
| 🆓 | **Free forever** — no hidden fees, no paywalls |
| ⚡ | Real-time communication via WebSocket |
| 🧩 | Channel-based pub/sub architecture |
| 🔁 | Automatic reconnection with exponential backoff |
| 🪶 | Lightweight (~5KB) and zero config |
| 🔒 | Secure WSS connections |
| 📦 | Works in Node.js and Browser |

---

## 📦 API Reference

### `new EventFlow(appKey, options?)`

Create a new client instance.

| Parameter | Type | Description |
|---|---|---|
| `appKey` | `string` | **Required.** Your App Key from [evnt-flow.com](https://evnt-flow.com) |
| `options.host` | `string` | WebSocket server URL (default: `wss://wss.evnt-flow.com`) |
| `options.debug` | `boolean` | Enable debug console logs (default: `false`) |

```js
const ef = new EventFlow('YOUR_APP_KEY', { debug: true })
```

---

### `ef.subscribe(channelName)` → `EventFlowChannel`

Subscribe to a channel. Returns a channel object.

```js
const channel = ef.subscribe('chat-room')
```

---

### `channel.on(eventName, callback)` → `this`

Listen for a specific event on this channel.

```js
channel.on('new-message', (data) => {
  console.log(data)
})
```

---

### `channel.trigger(eventName, data)` → `this`

Send an event to the channel. All **other** subscribers will receive it.

```js
channel.trigger('new-message', { text: 'Hi there!' })
```

> 💡 The sender is excluded from the broadcast — only other clients receive the message.

---

### `channel.off(eventName)` → `this`

Remove an event listener.

```js
channel.off('new-message')
```

---

### `ef.unsubscribe(channelName)`

Unsubscribe from a specific channel.

---

### `ef.disconnect()`

Disconnect from the server and clean up all subscriptions.

---

### `ef.onError(callback)`

Listen for server-side errors (subscription errors, rate limit blocks, etc.)

```js
ef.onError((err) => {
  console.error('EventFlow error:', err)
})
```

---

### `ef.connected()` → `boolean`

Check if the client is currently connected.

---

## 🧪 Testing

To test message delivery locally:

1. Open **two terminals** (or two browser tabs)
2. Both connect with the same App Key and subscribe to the same channel
3. Send from one → receive in the other

The sender **never** receives their own messages — this is by design.

---

## 📁 Example

See the [`/example`](./example) folder for a full interactive test client with UI.

---

## 🆓 Pricing

EventFlow is **free forever** with generous limits:

- ✅ 50 messages/sec
- ✅ 500 peak connections
- ✅ 1 App Key
- ✅ Unlimited channels

Need more? Check out paid plans at [evnt-flow.com](https://evnt-flow.com).

---

## 📄 License

MIT © [EventFlow](https://evnt-flow.com)
