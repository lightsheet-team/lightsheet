import Event from "../../../src/core/event/event";
import EventType from "../../../src/core/event/eventType";
import EventState from "../../../src/core/event/eventState";
import Events from "../../../src/core/event/events";

describe("Events", () => {
  let events: Events;

  beforeEach(() => {
    events = new Events();
  });

  test("should register and trigger an event", () => {
    const mockCallback = jest.fn();
    events.on(EventType.UI_SET_CELL, mockCallback);

    const event = new Event(
      EventType.UI_SET_CELL,
      "test payload",
      false,
      EventState.PRE_EVENT,
    );
    events.emit(event);

    expect(mockCallback).toHaveBeenCalledWith("test payload");
    expect(event.eventState).toBe(EventState.POST_EVENT);
  });

  test("should register a one-time event and trigger it just once", () => {
    const mockCallback = jest.fn();
    events.once(EventType.CORE_SET_CELL, mockCallback);

    const event = new Event(
      EventType.CORE_SET_CELL,
      "test payload",
      false,
      EventState.PRE_EVENT,
    );
    events.emit(event);
    events.emit(event);

    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  test("should remove an event listener", () => {
    const mockCallback = jest.fn();
    events.on(EventType.UI_SET_CELL, mockCallback);
    events.removeEventListener(EventType.UI_SET_CELL);

    const event = new Event(EventType.UI_SET_CELL, "test payload");
    events.emit(event);

    expect(mockCallback).not.toHaveBeenCalled();
  });
});
