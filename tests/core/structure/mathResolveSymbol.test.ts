import { CellState } from "../../../src/core/structure/cell/cellState";
import Sheet from "../../../src/core/structure/sheet";

describe("Math resolve test", () => {
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

  it("should return A1 value when =A1", () => {
    sheet.setCellAt(2, 0, "=A1");
    const cellInfo = sheet.getCellInfoAt(2, 0);
    expect(cellInfo?.state).toBe(CellState.OK);
    expect(cellInfo?.resolvedValue).toBe("1");
  });

  it("should return A1+A2 value when =A1+A2", () => {
    sheet.setCellAt(2, 0, "=A1+A2");
    const cellInfo = sheet.getCellInfoAt(2, 0);
    expect(cellInfo?.state).toBe(CellState.OK);
    expect(cellInfo?.resolvedValue).toBe("4");
  });

  it("should return A1+A2 value when =sum(A1,A2)", () => {
    sheet.setCellAt(2, 0, "=sum(A1,A2)");
    const cellInfo = sheet.getCellInfoAt(2, 0);
    expect(cellInfo?.state).toBe(CellState.OK);
    expect(cellInfo?.resolvedValue).toBe("4");
  });

  it("should return A1+A2+A3 value when =sum(A1:A3)", () => {
    sheet.setCellAt(2, 0, "=sum(A1:A3)");
    const cellInfo = sheet.getCellInfoAt(2, 0);
    expect(cellInfo?.state).toBe(CellState.OK);
    expect(cellInfo?.resolvedValue).toBe("9");
  });

  //TODO: This test should be changed to return OK instead of INVALID_EXPRESSION
  it("should return invalid value when =A11", () => {
    sheet.setCellAt(2, 0, "=A11");
    const cellInfo = sheet.getCellInfoAt(2, 0);
    expect(cellInfo?.state).toBe(CellState.INVALID_EXPRESSION);
    expect(cellInfo?.resolvedValue).toBe("");
  });

  it("should return invalid value when =A", () => {
    sheet.setCellAt(2, 0, "=A");
    const cellInfo = sheet.getCellInfoAt(2, 0);
    expect(cellInfo?.state).toBe(CellState.INVALID_EXPRESSION);
    expect(cellInfo?.resolvedValue).toBe("");
  });

  it("should return invalid value when =A1A2", () => {
    sheet.setCellAt(2, 0, "=A1A2");
    const cellInfo = sheet.getCellInfoAt(2, 0);
    expect(cellInfo?.state).toBe(CellState.INVALID_EXPRESSION);
    expect(cellInfo?.resolvedValue).toBe("");
  });

  it("should return invalid value when =A1+", () => {
    sheet.setCellAt(2, 0, "=A1+");
    const cellInfo = sheet.getCellInfoAt(2, 0);
    expect(cellInfo?.state).toBe(CellState.INVALID_EXPRESSION);
    expect(cellInfo?.resolvedValue).toBe("");
  });

  it("should return invalid value when =A/2", () => {
    sheet.setCellAt(2, 0, "=A/2");
    const cellInfo = sheet.getCellInfoAt(2, 0);
    expect(cellInfo?.state).toBe(CellState.INVALID_EXPRESSION);
    expect(cellInfo?.resolvedValue).toBe("");
  });

  it("should return invalid value when =%", () => {
    sheet.setCellAt(2, 0, "=%");
    const cellInfo = sheet.getCellInfoAt(2, 0);
    expect(cellInfo?.state).toBe(CellState.INVALID_EXPRESSION);
    expect(cellInfo?.resolvedValue).toBe("");
  });
});
