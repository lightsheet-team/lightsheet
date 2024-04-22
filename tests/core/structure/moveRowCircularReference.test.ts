import Sheet from "../../../src/core/structure/sheet";
import { CellState } from "../../../src/core/structure/cell/cellState";

describe("Row move circular reference test", () => {
  let sheet: Sheet;

  beforeEach(() => {
    window.sheetHolder?.clear();
    sheet = new Sheet("Sheet");
    // Set up initial linear references
    sheet.setCellAt(0, 0, "=B1"); // A1 references B1
    sheet.setCellAt(1, 0, "100"); // B1 has a static value
    sheet.setCellAt(0, 1, "=A1"); // A2 references A1
  });

  it("should detect a circular reference after row movement", () => {
    // Move A2 to A1's position, making A1 reference its own row indirectly through A2
    expect(sheet.moveRow(1, 0)).toBe(true);
    const A1 = sheet.getCellInfoAt(0, 0)!;
    const A2 = sheet.getCellInfoAt(0, 1)!;
    expect(A1.state).toBe(CellState.CIRCULAR_REFERENCE);
    expect(A2.state).toBe(CellState.CIRCULAR_REFERENCE);
    expect(A2.state).toBe(CellState.CIRCULAR_REFERENCE);
  });

  it("should resolve circular reference after moving row back to original position", () => {
    expect(sheet.moveRow(1, 0)).toBe(true);
    expect(sheet.moveRow(0, 1)).toBe(true);
    const originalA1 = sheet.getCellInfoAt(0, 0)!;
    const originalA2 = sheet.getCellInfoAt(0, 1)!;
    expect(originalA1.state).not.toBe(CellState.CIRCULAR_REFERENCE);
    expect(originalA2.state).not.toBe(CellState.CIRCULAR_REFERENCE);
  });
});
