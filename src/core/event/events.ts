import EventType from "./eventType";
import Event from "./event";
import EventState from "./eventState";
 
type ListenerFunction = (payload: any) => void;

export default class Events {
    private listeners: { [key in EventType]?: ListenerFunction };

    constructor() {
        this.listeners = {};
    }

    on(eventType: EventType, callback: ListenerFunction): void {
        this.listeners[eventType] = callback;
    }

    emit(event: Event): void {

        const listener = this.listeners[event.eventType];
        if (listener) {
            listener(event.payload);
        }

        if (event.eventState == EventState.PRE_EVENT && !event.canceled) {
            event.eventState = EventState.POST_EVENT;
            this.emit(event);
        }
            
    }

    once(eventType: EventType, callback: ListenerFunction): void {
        const oncecallback: ListenerFunction = (payload: any) => {
            this.removeEventListener(eventType);
            callback(payload);
        };
        this.on(eventType, oncecallback);
    }

    addEventListener(eventType: EventType, callback: ListenerFunction): void {
        this.on(eventType, callback);
    }

    removeEventListener(eventType: EventType): void {
        delete this.listeners[eventType];
    }
}