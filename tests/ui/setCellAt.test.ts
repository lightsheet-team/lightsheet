import Lightsheet from "../../src/main";

describe("Lightsheet setCellAt", () => {
  let lightSheet: Lightsheet;
  let targetElementMock: HTMLElement;

  beforeEach(() => {
    // Mocking UI and target element
    targetElementMock = document.createElement("div");

    // Creating instance of Lightsheet with mocked dependencies
    window.sheetHolder?.clear();
    lightSheet = new Lightsheet(
      {
        sheetName: "Sheet",
      },
      targetElementMock,
    );
    document.body.appendChild(targetElementMock);
  });
  afterEach(() => {
    document.body.removeChild(targetElementMock);
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
