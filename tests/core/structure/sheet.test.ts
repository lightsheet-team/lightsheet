import Sheet from "../../../src/core/structure/sheet";
import Cell from "../../../src/core/structure/cell/cell.ts";
import LightSheet from "../../../src/main.ts";

describe("Sheet", () => {
  let sheet: Sheet;

  beforeEach(() => {
    window.sheetHolder?.clear();
    sheet = new LightSheet({ sheetName: "Sheet1" }).sheet;
  });

  it("should set a cell value at a specified position", () => {
    const colPos = 1;
    const rowPos = 1;
    const value = "test value";

    sheet.setCellAt(colPos, rowPos, value);

    const iterator = window.sheetHolder.cellData.values();
    const cell = iterator.next().value;
    expect(cell).toBeInstanceOf(Cell);
    expect(cell!.rawValue).toBe(value);
  });
});
