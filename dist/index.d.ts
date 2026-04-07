import { Socket } from 'socket.io-client';
interface EventFlowOptions {
    host?: string;
    debug?: boolean;
}
interface EventPayload {
    channel: string;
    event: string;
    message: any;
}
declare class EventFlow {
    private socket;
    private channels;
    private appKey;
    private options;
    private isConnected;
    constructor(appKey: string, options?: EventFlowOptions);
    private _setupConnectionListeners;
    /**
     * Single message listener that dispatches to the correct channel.
     * Avoids duplicate listeners per channel.
     */
    private _setupMessageDispatcher;
    private _resubscribeAllChannels;
    subscribe(channelName: string): EventFlowChannel;
    unsubscribe(channelName: string): void;
    disconnect(): void;
    onError(callback: (data: any) => void): void;
    connected(): boolean;
}
declare class EventFlowChannel {
    private socket;
    private appKey;
    readonly channelName: string;
    private events;
    private debug;
    constructor(socket: Socket, appKey: string, channelName: string, debug?: boolean);
    _subscribe(): void;
    _handleIncoming(data: EventPayload): void;
    _destroy(): void;
    on(eventName: string, callback: (data: any) => void): this;
    off(eventName: string): this;
    trigger(eventName: string, message: any): this;
}
export default EventFlow;
