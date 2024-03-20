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

    const iterator = sheet.cell_data.values();
    const cell = iterator.next().value;
    expect(cell).toBeInstanceOf(Cell);
    expect(cell!.formula).toBe(value);
  });

  it("should reflect references in cell formulas in cell.referencesIn and cell.referencesOut", () => {
    const setCell = function (col: number, row: number, value: string) {
      const cInfo = sheet.setCellAt(col, row, value);
      const cKey = sheet.columns
        .get(cInfo.position.columnKey!)!
        .cellIndex.get(cInfo.position.rowKey!)!;
      return sheet.cell_data.get(cKey)!;
    };

    const cell1 = setCell(0, 0, "100"); // A1
    const cell2 = setCell(1, 0, "=A1"); // B1
    const cell3 = setCell(2, 2, "1"); // C3
    const cell4 = setCell(2, 0, "=A1 + B1 + C3"); // C1

    expect(cell1!.referencesIn).toEqual(new Set([cell2.key, cell4.key]));
    expect(cell1!.referencesOut.size).toBe(0);

    expect(cell2!.referencesOut).toEqual(new Set([cell1.key]));
    expect(cell2!.referencesIn).toEqual(new Set([cell4.key]));

    expect(cell3.referencesOut.size).toBe(0);
    expect(cell3.referencesIn).toEqual(new Set([cell4.key]));

    expect(cell4!.referencesOut).toEqual(
      new Set([cell1.key, cell2.key, cell3.key]),
    );
    expect(cell4!.referencesIn.size).toBe(0);

    // Deleting cells with references.
    const cell2pos = sheet.getCellInfoAt(1, 0)!;
    const cell4pos = sheet.getCellInfoAt(2, 0)!;
    sheet.deleteCell(cell2pos.position.columnKey!, cell2pos.position.rowKey!);
    sheet.deleteCell(cell4pos.position.columnKey!, cell4pos.position.rowKey!);

    expect(cell1!.referencesIn.size).toBe(0);
    expect(cell1!.referencesOut.size).toBe(0);
    expect(cell3!.referencesIn.size).toBe(0);
    expect(cell3!.referencesOut.size).toBe(0);
  });
});
