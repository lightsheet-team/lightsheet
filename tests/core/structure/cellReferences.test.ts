import Sheet from "../../../src/core/structure/sheet";
import { CellState } from "../../../src/core/structure/cell/cellState.ts";
import { CellInfo } from "../../../src/core/structure/sheet.types.ts";

describe("Cell references", () => {
  let sheet: Sheet;

  beforeEach(() => {
    sheet = new Sheet();
    sheet.setCellAt(0, 0, "1"); // A1
    sheet.setCellAt(1, 0, "2"); // B1
    sheet.setCellAt(0, 1, "3"); // A2
    sheet.setCellAt(1, 1, "4"); // B2
    sheet.setCellAt(0, 2, "5"); // A3
    sheet.setCellAt(1, 2, "6"); // B3
  });

  it("should create cells with references which are reflected by cell.referencesIn and cell.referencesOut", () => {
    const getCellReference = (cInfo: CellInfo) => {
      const cKey = sheet.columns
        .get(cInfo.position.columnKey!)!
        .cellIndex.get(cInfo.position.rowKey!)!;
      return sheet.cellData.get(cKey)!;
    };

    const cells = [
      getCellReference(sheet.setCellAt(0, 0, "100")), // A1
      getCellReference(sheet.setCellAt(1, 0, "=A1")), // B1
      getCellReference(sheet.setCellAt(2, 2, "1")), // C3
      getCellReference(sheet.setCellAt(2, 0, "=A1 + B1 + C3")), // C1
    ];

    expect(new Set(cells[0]!.referencesIn.keys())).toEqual(
      new Set([cells[1].key, cells[3].key]),
    );

    expect(cells[0]!.referencesOut.size).toBe(0);

    expect(new Set(cells[1]!.referencesOut.keys())).toEqual(
      new Set([cells[0].key]),
    );
    expect(new Set(cells[1]!.referencesIn.keys())).toEqual(
      new Set([cells[3].key]),
    );

    expect(cells[2].referencesOut.size).toBe(0);
    expect(new Set(cells[2].referencesIn.keys())).toEqual(
      new Set([cells[3].key]),
    );

    expect(new Set(cells[3]!.referencesOut.keys())).toEqual(
      new Set([cells[0].key, cells[1].key, cells[2].key]),
    );
    expect(cells[3]!.referencesIn.size).toBe(0);

    // Deleting cells with references.
    const cell2pos = sheet.getCellInfoAt(1, 0)!;
    const cell4pos = sheet.getCellInfoAt(2, 0)!;
    sheet.setCell(cell2pos.position.columnKey!, cell2pos.position.rowKey!, "");
    sheet.setCell(cell4pos.position.columnKey!, cell4pos.position.rowKey!, "");

    expect(cells[0].referencesIn.size).toBe(0);
    expect(cells[0].referencesOut.size).toBe(0);
    expect(cells[2].referencesIn.size).toBe(0);
    expect(cells[2].referencesOut.size).toBe(0);
  });

  it("should create and detect a circular reference", () => {
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
    sheet.setCellAt(0, 0, "=B1");
    sheet.setCellAt(1, 0, "=A2");
    sheet.setCellAt(0, 1, "=B2");
    sheet.setCellAt(1, 1, "=A3");
    sheet.setCellAt(0, 2, "=B3");

    const cells = [
      [0, 0], // A1
      [1, 0], // B1
      [0, 1], // A2
      [1, 1], // B2
      [0, 2], // A3
      [1, 2], // B3
    ];
    const refValue = sheet.getCellInfoAt(1, 2)!.value; // B3
    for (const c of cells) {
      const cellInfo = sheet.getCellInfoAt(c[0], c[1])!;
      expect(cellInfo.value).toBe(refValue);
    }
  });

  it("should create an empty cell with styling", () => {
    sheet.setCellAt(0, 0, "=B2");

    const colKey = sheet.columnPositions.get(1)!;
    const rowKey = sheet.rowPositions.get(1)!;
    sheet["createCell"](colKey, rowKey, ""); // B2
    expect(sheet.getCellInfoAt(1, 1)).not.toBeNull();

    sheet.setCellAt(0, 0, "");
    expect(sheet.getCellInfoAt(0, 0)).toBeNull();

    const b2 = sheet.getCellInfoAt(1, 1);
    expect(b2).not.toBeNull();

    // Clearing the style should result in the cell being deleted.
    sheet.setCellStyle(b2!.position.columnKey!, b2!.position.rowKey!, null);
    expect(sheet.getCellInfoAt(1, 1)).toBeNull();
  });

  it("should create a cell with a reference to a non-existent cell", () => {
    const colKey = sheet.columnPositions.get(1)!;
    const rowKey = sheet.rowPositions.get(1)!;
    sheet.setCell(colKey, rowKey, "");
    const cell = sheet.setCellAt(0, 0, "=B2");
    expect(cell.state).toBe(CellState.OK);
    expect(sheet.getCellInfoAt(1, 1)).not.toBeNull();

    // Delete the reference - this should result in the referred cell being deleted.
    sheet.setCellAt(0, 0, "123");
    expect(sheet.getCellInfoAt(1, 1)).toBeNull();
  });
});
