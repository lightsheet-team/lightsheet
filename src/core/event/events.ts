import EventType from "./eventType";
import Event from "./event";
import EventState from "./eventState";

type ListenerFunction = (payload: any) => void;

type EventListener = {
  callback: ListenerFunction;
  eventState: EventState;
};

export default class Events {
  private listeners: { [key in EventType]?: EventListener[] };

  constructor() {
    this.listeners = {};
  }

  on(
    eventType: EventType,
    callback: ListenerFunction,
    eventState: EventState = EventState.POST_EVENT,
  ): void {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    this.listeners[eventType]!.push({ callback, eventState });
  }

  emit(event: Event): void {
    const listeners = this.listeners[event.eventType];
    if (listeners) {
      listeners.slice().forEach((listener) => {
        if (listener.eventState === event.eventState) {
          listener.callback(event.payload);
        }
      });
    }

    if (event.eventState == EventState.PRE_EVENT && !event.canceled) {
      event.eventState = EventState.POST_EVENT;
      this.emit(event);
    }
  }

  once(
    eventType: EventType,
    callback: ListenerFunction,
    eventState: EventState = EventState.POST_EVENT,
  ): void {
    const oncecallback: ListenerFunction = (payload: any) => {
      this.removeEventListener(eventType, oncecallback, eventState);
      callback(payload);
    };
    this.on(eventType, oncecallback, eventState);
  }

  addEventListener(
    eventType: EventType,
    callback: ListenerFunction,
    eventState: EventState = EventState.POST_EVENT,
    once: boolean = false,
  ): void {
    if (!once) {
      this.on(eventType, callback, eventState);
    } else {
      this.once(eventType, callback, eventState);
    }
  }

  removeEventListener(
    eventType: EventType,
    callback: ListenerFunction,
    eventState: EventState = EventState.POST_EVENT,
  ): void {
    const listeners = this.listeners[eventType];
    if (listeners) {
      this.listeners[eventType] = listeners.filter(
        (listener) =>
          !(
            listener.callback === callback && listener.eventState === eventState
          ),
      );
    }
  }
}
