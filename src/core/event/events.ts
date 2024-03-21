import EventType from "./eventType";
import Event from "./event";
import EventState from "./eventState";
 
export default class Events {
    private listeners: { [key: string]: Function };

    constructor() {
        this.listeners = {};
    }

    on(eventType: EventType, callback: Function): void {
        this.listeners[eventType] = callback;
    }

    emit(event: Event): void {
        if (this.listeners[event.eventType]) {
            this.listeners[event.eventType](event.payload);
        }

        if (event.eventState == EventState.PRE_EVENT && !event.canceled) {
            event.eventState = EventState.POST_EVENT;
            this.emit(event);
        }
            
    }

    once(eventType: EventType, callback: Function): void {
        const oncecallback: Function = (payload: any) => {
            this.removeEventListener(eventType);
            callback(payload);
        };
        this.on(eventType, oncecallback);
    }

    addEventListener(eventType: EventType, callback: Function): void {
        this.on(eventType, callback);
    }

    removeEventListener(eventType: EventType): void {
        delete this.listeners[eventType];
    }
}