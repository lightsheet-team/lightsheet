import LightSheet from "../../src/main";
import LightSheetHelper from "../../src/utils/helpers";

describe("LightSheetHelper getCellIndexFromTd", () => {
  let lightSheet: LightSheet;
  let targetElementMock: HTMLElement;

  beforeEach(() => {
    // Mocking UI and target element
    targetElementMock = document.createElement("div");

    // Creating instance of LightSheet with mocked dependencies
    window.sheetHolder?.clear();
    lightSheet = new LightSheet(
      {
        sheetName: "Sheet",
      },
      targetElementMock,
    );
    document.body.appendChild(targetElementMock);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("getCellIndexFromTd returns the correct cell index", async () => {
    const cellInfo = lightSheet.setCellAt(1, 1, "B2");
    const cellKeyInTheDom = `${cellInfo.position.columnKey}_${cellInfo.position.rowKey}`;

    console.log(targetElementMock.innerHTML);
    console.log(cellKeyInTheDom);
    const cellElement = document.getElementById(cellKeyInTheDom);
    expect(cellElement).toBeTruthy();
    const cellIndex = LightSheetHelper.getCellIndexFromTd(cellElement!);

    expect(cellIndex).toEqual({ columnIndex: 1, rowIndex: 1 });
  });
});
