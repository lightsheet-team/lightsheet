import Sheet from "../../../src/core/structure/sheet";
import Cell from "../../../src/core/structure/cell/cell.ts";
import { CellState } from "../../../src/core/structure/cell/cellState.ts";

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

    const iterator = sheet.cellData.values();
    const cell = iterator.next().value;
    expect(cell).toBeInstanceOf(Cell);
    expect(cell!.formula).toBe(value);
  });

  it("should create cells with references which are reflected by cell.referencesIn and cell.referencesOut", () => {
    const setCell = function (col: number, row: number, value: string) {
      const cInfo = sheet.setCellAt(col, row, value);
      const cKey = sheet.columns
        .get(cInfo.position.columnKey!)!
        .cellIndex.get(cInfo.position.rowKey!)!;
      return sheet.cell_data.get(cKey)!;
    };

    const cells = [
      setCell(0, 0, "100"), // A1
      setCell(1, 0, "=A1"), // B1
      setCell(2, 2, "1"), // C3
      setCell(2, 0, "=A1 + B1 + C3"), // C1
    ];

    expect(cells[0]!.referencesIn).toEqual(
      new Set([cells[1].key, cells[3].key]),
    );

    expect(cells[0]!.referencesOut.size).toBe(0);

    expect(cells[1]!.referencesOut).toEqual(new Set([cells[0].key]));
    expect(cells[1]!.referencesIn).toEqual(new Set([cells[3].key]));

    expect(cells[2].referencesOut.size).toBe(0);
    expect(cells[2].referencesIn).toEqual(new Set([cells[3].key]));

    expect(cells[3]!.referencesOut).toEqual(
      new Set([cells[0].key, cells[1].key, cells[2].key]),
    );
    expect(cells[3]!.referencesIn.size).toBe(0);

    // Deleting cells with references.
    const cell2pos = sheet.getCellInfoAt(1, 0)!;
    const cell4pos = sheet.getCellInfoAt(2, 0)!;
    sheet.deleteCell(cell2pos.position.columnKey!, cell2pos.position.rowKey!);
    sheet.deleteCell(cell4pos.position.columnKey!, cell4pos.position.rowKey!);

    expect(cells[0].referencesIn.size).toBe(0);
    expect(cells[0].referencesOut.size).toBe(0);
    expect(cells[2].referencesIn.size).toBe(0);
    expect(cells[2].referencesOut.size).toBe(0);
  });

  it("should create and detect a circular reference", () => {
    sheet.setCellAt(1, 0, "0"); // B1
    sheet.setCellAt(1, 1, "0"); // B2
    sheet.setCellAt(0, 1, "0"); // A2

    // A1 -> B1 -> B2 -> A2 -> A1
    sheet.setCellAt(0, 0, "=B1 + 100"); // A1
    sheet.setCellAt(1, 0, "=B2 * 2"); // B1
    sheet.setCellAt(1, 1, "=A2 - 200"); // B2

    let final = sheet.setCellAt(0, 1, "=A1 - 200"); // A2 -> A1
    expect(final.state).toBe(CellState.CIRCULAR_REFERENCE);

    // Check simple case of A1 -> B1 -> A1.
    final = sheet.setCellAt(1, 0, "100");
    expect(final.state).toBe(CellState.OK);
    final = sheet.setCellAt(1, 0, "=A1 - 200");
    expect(final.state).toBe(CellState.CIRCULAR_REFERENCE);
  });

  it("should create a chain of direct cell references", () => {
    // A1 -> B1 -> A2 -> B2 -> A3 -> B3; All cells will have the value of B3.
    const cellInfo = [
      [0, 0, "0"], // A1
      [1, 0, "0"], // B1
      [0, 1, "0"], // A2
      [1, 1, "0"], // B2
      [0, 2, "0"], // A3
      [1, 2, "10"], // B3
    ];
    const cells = [];
    // Initialize the cells first to generate cell keys.
    for (const c of cellInfo) {
      cells.push(
        sheet.setCellAt(c[0] as number, c[1] as number, c[2] as string),
      );
    }

    sheet.setCellAt(0, 0, "=B1");
    sheet.setCellAt(1, 0, "=A2");
    sheet.setCellAt(0, 1, "=B2");
    sheet.setCellAt(1, 1, "=A3");
    sheet.setCellAt(0, 2, "=B3");
    for (const c of cellInfo) {
      const cellInfo = sheet.getCellInfoAt(c[0] as number, c[1] as number)!;
      expect(cellInfo.value).toBe("10");
    }
  });
});
