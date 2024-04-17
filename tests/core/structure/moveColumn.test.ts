import Sheet from "../../../src/core/structure/sheet.ts";

describe("move column test", () => {
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

  it("should move column right and shift the other columns correctly", () => {
    sheet.moveColumn(0, 2);
    expect(sheet.getCellInfoAt(2, 0)!.resolvedValue).toBe("1x1");
    expect(sheet.getCellInfoAt(0, 0)!.resolvedValue).toBe("2x1");
    expect(sheet.getCellInfoAt(1, 0)!.resolvedValue).toBe("3x1");
    expect(sheet.getCellInfoAt(0, 1)!.resolvedValue).toBe("2x2");
    expect(sheet.getCellInfoAt(1, 1)!.resolvedValue).toBe("3x2");
    expect(sheet.getCellInfoAt(2, 1)!.resolvedValue).toBe("1x2");
  });

  it("should move column left and shift the other columns correctly", () => {
    sheet.moveColumn(2, 0);
    expect(sheet.getCellInfoAt(2, 0)!.resolvedValue).toBe("2x1");
    expect(sheet.getCellInfoAt(0, 0)!.resolvedValue).toBe("3x1");
    expect(sheet.getCellInfoAt(1, 0)!.resolvedValue).toBe("1x1");
    expect(sheet.getCellInfoAt(0, 1)!.resolvedValue).toBe("3x2");
    expect(sheet.getCellInfoAt(1, 1)!.resolvedValue).toBe("1x2");
    expect(sheet.getCellInfoAt(2, 1)!.resolvedValue).toBe("2x2");
  });

  it("should move an empty column around", () => {
    sheet.insertColumn(0);
    sheet.moveColumn(0, 2);
    expect(sheet.getCellInfoAt(0, 0)!.resolvedValue).toBe("1x1");
    expect(sheet.getCellInfoAt(1, 0)!.resolvedValue).toBe("2x1");
    expect(sheet.getCellInfoAt(2, 0)).toBe(null);
    expect(sheet.getCellInfoAt(3, 0)!.resolvedValue).toBe("3x1");
    expect(sheet.getCellInfoAt(0, 1)!.resolvedValue).toBe("1x2");
    expect(sheet.getCellInfoAt(1, 1)!.resolvedValue).toBe("2x2");
    expect(sheet.getCellInfoAt(2, 1)).toBe(null);
    expect(sheet.getCellInfoAt(3, 1)!.resolvedValue).toBe("3x2");
  });

  it("should move column right a single column without shifting other columns", () => {
    sheet.moveColumn(0, 1);
    expect(sheet.getCellInfoAt(1, 0)!.resolvedValue).toBe("1x1");
    expect(sheet.getCellInfoAt(0, 0)!.resolvedValue).toBe("2x1");
    expect(sheet.getCellInfoAt(2, 0)!.resolvedValue).toBe("3x1");
    expect(sheet.getCellInfoAt(0, 1)!.resolvedValue).toBe("2x2");
    expect(sheet.getCellInfoAt(2, 1)!.resolvedValue).toBe("3x2");
    expect(sheet.getCellInfoAt(1, 1)!.resolvedValue).toBe("1x2");
  });
});
