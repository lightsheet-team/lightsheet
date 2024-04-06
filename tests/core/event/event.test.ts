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

    const event = new Event(EventType.UI_SET_CELL, "test payload", false);
    events.emit(event);

    expect(mockCallback).toHaveBeenCalledWith(event);
    expect(event.eventState).toBe(EventState.POST_EVENT);
  });

  test("should transition from PRE_EVENT to POST_EVENT state", () => {
    const preEventCallback = jest.fn();
    const postEventCallback = jest.fn();
    const event = new Event(
      EventType.CORE_SET_CELL,
      null,
      false,
      EventState.PRE_EVENT,
    );

    events.on(EventType.CORE_SET_CELL, preEventCallback, EventState.PRE_EVENT);
    events.on(EventType.CORE_SET_CELL, postEventCallback);
    events.emit(event);

    expect(preEventCallback).toHaveBeenCalled();
    expect(postEventCallback).toHaveBeenCalled();
  });

  test("should register a one-time post-event callback and trigger it just once", () => {
    const mockCallback = jest.fn();
    events.addEventListener(
      EventType.CORE_SET_CELL,
      mockCallback,
      EventState.POST_EVENT,
      true,
    );

    const event = new Event(EventType.CORE_SET_CELL, "test payload", false);
    events.emit(event);
    expect(mockCallback).toHaveBeenCalledTimes(1);
    events.emit(event);
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  test("should register a one-time post-event callback and trigger it just once with transition from pre-event to post-event", () => {
    const preMockCallback = jest.fn();
    const postMockCallback = jest.fn();
    events.once(EventType.CORE_SET_CELL, postMockCallback);
    events.on(EventType.CORE_SET_CELL, preMockCallback);

    const event = new Event(
      EventType.CORE_SET_CELL,
      "test payload",
      false,
      EventState.PRE_EVENT,
    );
    events.emit(event);
    events.emit(event);
    events.emit(event);

    expect(preMockCallback).toHaveBeenCalledTimes(3);
    expect(postMockCallback).toHaveBeenCalledTimes(1);
  });

  test("should register a one-time pre-event callback and trigger it just once", () => {
    const preMockCallback = jest.fn();
    const postMockCallback = jest.fn();
    events.once(EventType.CORE_SET_CELL, preMockCallback, EventState.PRE_EVENT);
    events.on(EventType.CORE_SET_CELL, postMockCallback, EventState.POST_EVENT);

    const event = new Event(
      EventType.CORE_SET_CELL,
      "test payload",
      false,
      EventState.PRE_EVENT,
    );
    events.emit(event);
    expect(preMockCallback).toHaveBeenCalledTimes(1);
    events.emit(event);
    expect(preMockCallback).toHaveBeenCalledTimes(1);
    expect(postMockCallback).toHaveBeenCalledTimes(2);
  });

  test("should remove an event listener", () => {
    const mockCallback = jest.fn();
    events.on(EventType.UI_SET_CELL, mockCallback);
    events.removeEventListener(EventType.UI_SET_CELL, mockCallback);

    const event = new Event(EventType.UI_SET_CELL, "test payload");
    events.emit(event);

    expect(mockCallback).not.toHaveBeenCalled();
  });

  test("should remove an event listener only with correct state", () => {
    const mockCallback = jest.fn();
    events.on(EventType.UI_SET_CELL, mockCallback);
    events.on(EventType.UI_SET_CELL, mockCallback, EventState.PRE_EVENT);

    events.removeEventListener(
      EventType.UI_SET_CELL,
      mockCallback,
      EventState.PRE_EVENT,
    );

    const event = new Event(
      EventType.UI_SET_CELL,
      "test payload",
      false,
      EventState.PRE_EVENT,
    );
    events.emit(event);

    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  test("should handle multiple listeners for the same event", () => {
    const firstCallback = jest.fn();
    const secondCallback = jest.fn();
    events.on(EventType.UI_SET_CELL, firstCallback);
    events.on(EventType.UI_SET_CELL, secondCallback);

    const event = new Event(EventType.UI_SET_CELL, "test payload");
    events.emit(event);

    expect(firstCallback).toHaveBeenCalledWith(event);
    expect(secondCallback).toHaveBeenCalledWith(event);
  });

  test("should not trigger listeners of a different event type", () => {
    const mockCallback = jest.fn();
    events.on(EventType.UI_SET_CELL, mockCallback);

    const event = new Event(EventType.CORE_SET_CELL, "test payload");
    events.emit(event);

    expect(mockCallback).not.toHaveBeenCalled();
  });

  test("should not trigger listeners after they are removed", () => {
    const mockCallback = jest.fn();
    events.on(EventType.UI_SET_CELL, mockCallback);
    events.removeEventListener(EventType.UI_SET_CELL, mockCallback);

    const event = new Event(EventType.UI_SET_CELL, "test payload");
    events.emit(event);

    expect(mockCallback).not.toHaveBeenCalled();
  });

  test("should handle the cancellation of an event", () => {
    const mockCallback = jest.fn(() => {
      event.canceled = true;
    });
    const anotherCallback = jest.fn();

    events.on(EventType.UI_SET_CELL, mockCallback, EventState.PRE_EVENT);
    events.addEventListener(EventType.UI_SET_CELL, anotherCallback);

    const event = new Event(
      EventType.UI_SET_CELL,
      "test payload",
      false,
      EventState.PRE_EVENT,
    );
    events.emit(event);

    expect(mockCallback).toHaveBeenCalled();
    expect(anotherCallback).not.toHaveBeenCalled();
    expect(event.canceled).toBe(true);
  });

  test("should distinguish between different event states", () => {
    const preEventCallback = jest.fn();
    const postEventCallback = jest.fn();

    events.addEventListener(
      EventType.UI_SET_CELL,
      preEventCallback,
      EventState.PRE_EVENT,
    );
    events.on(EventType.UI_SET_CELL, postEventCallback, EventState.POST_EVENT);

    const preEvent = new Event(
      EventType.UI_SET_CELL,
      "pre payload",
      false,
      EventState.PRE_EVENT,
    );
    const postEvent = new Event(
      EventType.UI_SET_CELL,
      "post payload",
      false,
      EventState.POST_EVENT,
    );

    events.emit(preEvent);
    events.emit(postEvent);

    expect(preEventCallback).toHaveBeenCalledWith(preEvent);
    expect(postEventCallback).toHaveBeenCalledWith(postEvent);
  });
});
