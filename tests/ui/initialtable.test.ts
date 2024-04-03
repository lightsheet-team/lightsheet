import LightSheet from "../../src/main";

describe("LightSheet", () => {
  let lightSheet: LightSheet;
  let targetElementMock;

  beforeEach(() => {
    // Mocking UI and target element
    targetElementMock = document.createElement("div");

    // Creating instance of LightSheet with mocked dependencies
    lightSheet = new LightSheet(targetElementMock, { data: [] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("initializeData method creates header with the correct number of children in UI", () => {
    // Get the number of children of tableHeadDom
    const tbodyElement = document.querySelector('tbody')
    const rowCount = tbodyElement?.children.length
    // Get the number of children of tableBodyDom
    const colCount = tbodyElement?.children[0].children.length;

    // Expect that the number of children matches the defaultRowCount since no data is provided
    expect(colCount).toBe(lightSheet.options.defaultColCount);
    expect(rowCount).toBe(lightSheet.options.defaultRowCount);
  });
});
