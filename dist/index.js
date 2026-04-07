// EventFlow Client Library v1.0.0
// Real-time event streaming via WebSocket
// https://evnt-flow.com
import { io } from 'socket.io-client';
class EventFlow {
    constructor(appKey, options = {}) {
        this.channels = new Map();
        this.isConnected = false;
        if (!appKey)
            throw new Error('EventFlow: appKey is required');
        this.appKey = appKey;
        this.options = options;
        this.socket = io(options.host || 'wss://wss.evnt-flow.com', {
            path: '/socket.io',
            query: { appKey },
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000
        });
        this._setupConnectionListeners();
        this._setupMessageDispatcher();
    }
    _setupConnectionListeners() {
        this.socket.on('connect', () => {
            this.isConnected = true;
            if (this.options.debug)
                console.log('⚡ EventFlow connected');
            this._resubscribeAllChannels();
        });
        this.socket.on('disconnect', (reason) => {
            this.isConnected = false;
            if (this.options.debug)
                console.log('🔌 EventFlow disconnected:', reason);
        });
        this.socket.on('connect_error', (error) => {
            if (this.options.debug)
                console.error('❌ EventFlow connection error:', error.message);
        });
    }
    /**
     * Single message listener that dispatches to the correct channel.
     * Avoids duplicate listeners per channel.
     */
    _setupMessageDispatcher() {
        this.socket.on('message', (data) => {
            if (!data || !data.channel || !data.event)
                return;
            const channel = this.channels.get(data.channel);
            if (channel) {
                channel._handleIncoming(data);
            }
        });
    }
    _resubscribeAllChannels() {
        if (this.options.debug)
            console.log(`🔄 Resubscribing to ${this.channels.size} channels`);
        this.channels.forEach((channel) => {
            channel._subscribe();
        });
    }
    subscribe(channelName) {
        if (!channelName)
            throw new Error('EventFlow: channelName is required');
        if (!this.channels.has(channelName)) {
            const channel = new EventFlowChannel(this.socket, this.appKey, channelName, this.options.debug);
            this.channels.set(channelName, channel);
        }
        return this.channels.get(channelName);
    }
    unsubscribe(channelName) {
        const channel = this.channels.get(channelName);
        if (channel) {
            channel._destroy();
            this.channels.delete(channelName);
            if (this.options.debug)
                console.log(`🚫 Unsubscribed from ${channelName}`);
        }
    }
    disconnect() {
        this.channels.forEach((channel) => channel._destroy());
        this.channels.clear();
        this.socket.disconnect();
        this.isConnected = false;
        if (this.options.debug)
            console.log('👋 EventFlow disconnected');
    }
    onError(callback) {
        this.socket.on('subscription-error', callback);
        this.socket.on('message-error', callback);
    }
    connected() {
        return this.isConnected;
    }
}
class EventFlowChannel {
    constructor(socket, appKey, channelName, debug = false) {
        this.events = new Map();
        this.socket = socket;
        this.appKey = appKey;
        this.channelName = channelName;
        this.debug = debug;
        this._subscribe();
    }
    _subscribe() {
        if (this.debug)
            console.log(`📲 Subscribing to channel: ${this.channelName}`);
        this.socket.emit('subscribe', { appKey: this.appKey, channel: this.channelName });
    }
    _handleIncoming(data) {
        if (this.debug)
            console.log(`📨 Received on ${this.channelName}:`, data);
        const callback = this.events.get(data.event);
        if (callback) {
            callback(data.message);
        }
    }
    _destroy() {
        this.events.clear();
    }
    on(eventName, callback) {
        if (this.debug)
            console.log(`👂 Listening for ${eventName} on ${this.channelName}`);
        this.events.set(eventName, callback);
        return this;
    }
    off(eventName) {
        if (this.debug)
            console.log(`🔕 Removed listener for ${eventName} on ${this.channelName}`);
        this.events.delete(eventName);
        return this;
    }
    trigger(eventName, message) {
        if (this.debug)
            console.log(`📤 Triggering ${eventName} on ${this.channelName}`);
        this.socket.emit('message', {
            appKey: this.appKey,
            channel: this.channelName,
            event: eventName,
            message: message
        });
        return this;
    }
}
export default EventFlow;
