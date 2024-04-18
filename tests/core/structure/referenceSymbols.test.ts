import Sheet from "../../../src/core/structure/sheet.ts";

describe("Cell reference symbol tests", () => {
  let sheet: Sheet;

  beforeEach(() => {
    window.sheetHolder?.clear();
    sheet = new Sheet("Sheet");
    sheet.setCellAt(0, 0, "1x1");
    sheet.setCellAt(1, 0, "2x1");
    sheet.setCellAt(2, 0, "3x1");
    sheet.setCellAt(0, 1, "1x2");
    sheet.setCellAt(1, 1, "2x2");
    sheet.setCellAt(2, 1, "3x2");
  });

  it("should move a column with cell references without invalidating them", () => {
    sheet.setCellAt(2, 0, "=A1");
    sheet.setCellAt(2, 1, "=B1");
    sheet.moveColumn(1, 0);
    expect(sheet.getCellInfoAt(2, 0)!.rawValue).toBe("=B1");
    expect(sheet.getCellInfoAt(2, 1)!.rawValue).toBe("=A1");
  });

  it("should insert a column without invalidating references in the sheet", () => {
    sheet.setCellAt(0, 0, "=C1");
    sheet.setCellAt(0, 1, "=D1");
    sheet.insertColumn(0);
    expect(sheet.getCellInfoAt(1, 0)!.rawValue).toBe("=D1");
    expect(sheet.getCellInfoAt(1, 1)!.rawValue).toBe("=E1");
  });

  it("should move a column anchoring a range reference and modify the range", () => {
    sheet.setCellAt(6, 0, "=A1:C1");
    sheet.moveColumn(2, 5);
    expect(sheet.getCellInfoAt(6, 0)!.rawValue).toBe("=A1:F1");
  });

  it("should move a column within a range reference and leave the range unmodified", () => {
    sheet.setCellAt(6, 0, "=A1:C1");
    sheet.moveColumn(1, 5);
    expect(sheet.getCellInfoAt(6, 0)!.rawValue).toBe("=A1:C1");
  });

  it("should insert a column without invalidating a cross-sheet reference", () => {
    // Create a second sheet
    const sheet2 = new Sheet("Sheet2");

    sheet2.setCellAt(0, 0, "=Sheet!C1");
    sheet2.setCellAt(0, 1, "=Sheet!D1");
    sheet.insertColumn(0);
    expect(sheet2.getCellInfoAt(0, 0)!.rawValue).toBe("=Sheet!D1");
    expect(sheet2.getCellInfoAt(0, 1)!.rawValue).toBe("=Sheet!E1");
  });
});
