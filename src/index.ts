// Emitra Client Library v2.0.0
// Real-time event streaming via WebSocket
// https://evnt-flow.com

import { io, Socket } from 'socket.io-client'

interface EmitraOptions {
    host?: string
    debug?: boolean
}

interface EventPayload {
    channel: string
    event: string
    message: any
}

class Emitra {
    private socket: Socket
    private channels: Map<string, EmitraChannel> = new Map()
    private appKey: string
    private options: EmitraOptions
    private isConnected: boolean = false

    constructor(appKey: string, options: EmitraOptions = {}) {
        if (!appKey) throw new Error('Emitra: appKey is required')

        this.appKey = appKey
        this.options = options
        this.socket = io(options.host || 'wss://wss.evnt-flow.com', {
            path: '/socket.io',
            query: { appKey },
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000
        })

        this._setupConnectionListeners()
        this._setupMessageDispatcher()
    }

    private _setupConnectionListeners() {
        this.socket.on('connect', () => {
            this.isConnected = true
            if (this.options.debug) console.log('⚡ Emitra connected')
            this._resubscribeAllChannels()
        })

        this.socket.on('disconnect', (reason) => {
            this.isConnected = false
            if (this.options.debug) console.log('🔌 Emitra disconnected:', reason)
        })

        this.socket.on('connect_error', (error) => {
            if (this.options.debug) console.error('❌ Emitra connection error:', error.message)
        })
    }

    /**
     * Single message listener that dispatches to the correct channel.
     * Avoids duplicate listeners per channel.
     */
    private _setupMessageDispatcher() {
        this.socket.on('message', (data: EventPayload) => {
            if (!data || !data.channel || !data.event) return

            const channel = this.channels.get(data.channel)
            if (channel) {
                channel._handleIncoming(data)
            }
        })
    }

    private _resubscribeAllChannels() {
        if (this.options.debug) console.log(`🔄 Resubscribing to ${this.channels.size} channels`)
        this.channels.forEach((channel) => {
            channel._subscribe()
        })
    }

    subscribe(channelName: string): EmitraChannel {
        if (!channelName) throw new Error('Emitra: channelName is required')

        if (!this.channels.has(channelName)) {
            const channel = new EmitraChannel(
                this.socket,
                this.appKey,
                channelName,
                this.options.debug
            )
            this.channels.set(channelName, channel)
        }
        return this.channels.get(channelName)!
    }

    unsubscribe(channelName: string): void {
        const channel = this.channels.get(channelName)
        if (channel) {
            channel._destroy()
            this.channels.delete(channelName)
            if (this.options.debug) console.log(`🚫 Unsubscribed from ${channelName}`)
        }
    }

    disconnect(): void {
        this.channels.forEach((channel) => channel._destroy())
        this.channels.clear()
        this.socket.disconnect()
        this.isConnected = false
        if (this.options.debug) console.log('👋 Emitra disconnected')
    }

    onError(callback: (data: any) => void): void {
        this.socket.on('subscription-error', callback)
        this.socket.on('message-error', callback)
    }

    connected(): boolean {
        return this.isConnected
    }
}

class EmitraChannel {
    private socket: Socket
    private appKey: string
    readonly channelName: string
    private events: Map<string, (data: any) => void> = new Map()
    private debug: boolean

    constructor(socket: Socket, appKey: string, channelName: string, debug: boolean = false) {
        this.socket = socket
        this.appKey = appKey
        this.channelName = channelName
        this.debug = debug

        this._subscribe()
    }

    _subscribe(): void {
        if (this.debug) console.log(`📲 Subscribing to channel: ${this.channelName}`)
        this.socket.emit('subscribe', { appKey: this.appKey, channel: this.channelName })
    }

    _handleIncoming(data: EventPayload): void {
        if (this.debug) console.log(`📨 Received on ${this.channelName}:`, data)
        const callback = this.events.get(data.event)
        if (callback) {
            callback(data.message)
        }
    }

    _destroy(): void {
        this.events.clear()
    }

    on(eventName: string, callback: (data: any) => void): this {
        if (this.debug) console.log(`👂 Listening for ${eventName} on ${this.channelName}`)
        this.events.set(eventName, callback)
        return this
    }

    off(eventName: string): this {
        if (this.debug) console.log(`🔕 Removed listener for ${eventName} on ${this.channelName}`)
        this.events.delete(eventName)
        return this
    }

    trigger(eventName: string, message: any): this {
        if (this.debug) console.log(`📤 Triggering ${eventName} on ${this.channelName}`)
        this.socket.emit('message', {
            appKey: this.appKey,
            channel: this.channelName,
            event: eventName,
            message: message
        })
        return this
    }
}

export default Emitra
