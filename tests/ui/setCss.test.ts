import LightSheet from "../../src/main";

describe("LightSheet", () => {
  let targetElementMock: HTMLElement;

  beforeEach(() => {
    window.sheetHolder?.clear();
    targetElementMock = document.createElement("div");
    document.body.appendChild(targetElementMock);
  });

  afterEach(() => {
    document.body.removeChild(targetElementMock);
  });

  test("Should be able to render table based on provided styles", () => {
    const styleString = "font-weight: bold;";

    new LightSheet(
      {
        data: [
          ["1", "=1+2/3*6+A1+test(1,2)", "img/nophoto.jpg", "Marketing"],
          ["2.44445", "400000.000000", "img/nophoto.jpg", "Marketing", "3120"],
          ["3.555555", "Jorge", "img/nophoto.jpg", "Marketing", "3120"],
        ],
        sheetName: "Sheet",
        style: [
          {
            position: "A1",
            css: styleString,
          },
        ],
      },
      targetElementMock,
    );

    const tableBody = targetElementMock.querySelector("tbody");
    if (!tableBody) {
      // If tbody is not found, fail the test or log an error
      fail("tbody element not found in the table.");
    }

    expect(
      (tableBody.rows[0].children[1] as HTMLElement).style.cssText,
    ).toEqual(styleString);
  });

  test("Should be able to clear existing table style", () => {
    const styleString = "font-weight: bold;";

    const ls = new LightSheet(
      {
        data: [
          ["1", "=1+2/3*6+A1+test(1,2)", "img/nophoto.jpg", "Marketing"],
          ["2.44445", "400000.000000", "img/nophoto.jpg", "Marketing", "3120"],
          ["3.555555", "Jorge", "img/nophoto.jpg", "Marketing", "3120"],
        ],
        sheetName: "Sheet",
        style: [
          {
            position: "A1",
            css: styleString,
          },
        ],
      },
      targetElementMock,
    );
    ls.clearCss("A");

    const tableBody = targetElementMock.querySelector("tbody");
    if (!tableBody) {
      // If tbody is not found, fail the test or log an error
      fail("tbody element not found in the table.");
    }

    expect(
      (tableBody.rows[0].children[1] as HTMLElement).style.cssText,
    ).toEqual("");
  });
});
