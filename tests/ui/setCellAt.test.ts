import LightSheet from "../../src/main";

describe("LightSheet setCellAt", () => {
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

  it("Should set the cell and use col and row keys", () => {
    const cellInfo = lightSheet.setCellAt(1, 1, "test");

    //Query the HTML via document else it will not be able to find the element
    const cellId = cellInfo.position.columnKey + "_" + cellInfo.position.rowKey;
    const cellElement = document.getElementById(cellId);

    const cellInput = cellElement?.children[0] as HTMLInputElement;
    expect(cellInput.value).toBe("test");
  });

  it("Should set the cell at the correct position in the DOM", () => {
    lightSheet.setCellAt(2, 3, "test");

    //Query the HTML via document else it will not be able to find the element
    const tableElement = document.querySelector("table");
    //This Table API accept position as 1 based index
    const cellElement = tableElement?.rows[4]?.cells[3];

    const cellInput = cellElement?.children[0] as HTMLInputElement;
    expect(cellInput.value).toBe("test");
  });
});
