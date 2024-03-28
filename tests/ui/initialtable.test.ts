import LightSheet from "../../src/main";

describe("LightSheet", () => {
  let lightSheet: LightSheet;
  let targetElementMock;
  const defaultRowCount = 4;
  const defaultColCount = 5;

  beforeEach(() => {
    // Mocking UI and target element
    targetElementMock = document.createElement("div");

    // Creating instance of LightSheet with mocked dependencies
    lightSheet = new LightSheet(targetElementMock, { data: [] });
    // lightSheet.ui = lightSheet;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("initializeData method creates header with the correct number of children in UI", () => {
    // Get the number of children of tableHeadDom
    const colCount = lightSheet.ui.tableHeadDom.children[0].children.length;
    // Get the number of children of tableBodyDom
    const rowCount = lightSheet.ui.tableBodyDom.children.length;

    // Expect that the number of children matches the defaultRowCount since no data is provided
    expect(colCount).toBe(defaultColCount);
    expect(rowCount).toBe(defaultRowCount);
  });
});
