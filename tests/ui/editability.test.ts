import LightSheet from "../../src/main";

describe("LightSheet", () => {
  let targetElementMock: HTMLElement;

  beforeEach(() => {
    targetElementMock = document.createElement("div");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("All input elements within the table have readonly property set to true when isReadOnly is true", () => {
    new LightSheet(targetElementMock, {
      data: [],
      isReadOnly: true,
    });

    const tableBody = targetElementMock.querySelector("tbody");
    if (!tableBody) {
      // If tbody is not found, fail the test or log an error
      fail("tbody element not found in the table.");
    }

    const inputElements = tableBody.querySelectorAll("input");

    inputElements.forEach((inputElement) => {
      expect(inputElement.readOnly).toBe(true);
    });
  });

  test("All input elements within the table have readonly property set to true when isReadOnly is false", () => {
    new LightSheet(targetElementMock, {
      data: [],
      isReadOnly: false,
    });

    const tableBody = targetElementMock.querySelector("tbody");
    if (!tableBody) {
      // If tbody is not found, fail the test or log an error
      fail("tbody element not found in the table.");
    }

    const inputElements = tableBody.querySelectorAll("input");

    inputElements.forEach((inputElement) => {
      expect(inputElement.readOnly).toBe(false);
    });
  });
});
