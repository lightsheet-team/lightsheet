import Lightsheet from "../../src/main";

describe("Lightsheet", () => {
  let targetElementMock: HTMLElement;

  beforeEach(() => {
    window.sheetHolder?.clear();
    targetElementMock = document.createElement("div");
    document.body.appendChild(targetElementMock);
  });

  afterEach(() => {
    document.body.removeChild(targetElementMock);
  });

  test("All input elements within the table have readonly property set to true when isReadOnly is true", () => {
    new Lightsheet(
      {
        data: [],
        sheetName: "Sheet",
        isReadOnly: true,
      },
      targetElementMock,
    );

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
    new Lightsheet(
      {
        data: [],
        sheetName: "Sheet",
        isReadOnly: false,
      },
      targetElementMock,
    );

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
