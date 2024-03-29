import EventType from "./eventType";
import EventState from "./eventState";

export default class Event {
  eventType: EventType;
  payload?: any;
  canceled: boolean;
  eventState: EventState;

  constructor(
    eventType: EventType,
    payload: any = null,
    canceled: boolean = false,
    eventState: EventState = EventState.POST_EVENT,
  ) {
    this.eventType = eventType;
    this.payload = payload;
    this.canceled = canceled;
    this.eventState = eventState;
  }
}
