import Sheet from "../../../src/core/structure/sheet";
import Cell from "../../../src/core/structure/cell/cell.ts";

describe("Sheet", () => {
  let sheet: Sheet;

  beforeEach(() => {
    sheet = new Sheet();
  });

  it("should set a cell value at a specified position", () => {
    const colPos = 1;
    const rowPos = 1;
    const value = "test value";

    sheet.setCellAt(colPos, rowPos, value);

    //const positionInfo = sheet.setCellAt(colPos, rowPos, value);
    const iterator = sheet.cell_data.values();
    const cell = iterator.next().value;
    expect(cell).toBeInstanceOf(Cell);
    expect(cell!.formula).toBe(value);
  });
});
