import Sheet from "../../../src/core/structure/sheet.ts";

describe("Delete column test", () => {
  let sheet: Sheet;

  beforeEach(() => {
    sheet = new Sheet();
    sheet.setCellAt(0, 0, "1x1");
    sheet.setCellAt(1, 0, "2x1");
    sheet.setCellAt(2, 0, "3x1");
    sheet.setCellAt(0, 1, "1x2");
    sheet.setCellAt(1, 1, "2x2");
    sheet.setCellAt(2, 1, "3x2");
  });

  it("Should delete column shift the other columns correctly", () => {
    sheet.deleteColumn(0);
    expect(sheet.getCellInfoAt(0, 0)!.value).toBe("2x1");
    expect(sheet.getCellInfoAt(1, 0)!.value).toBe("3x1");
    expect(sheet.getCellInfoAt(2, 0)).toBe(null);
    expect(sheet.getCellInfoAt(0, 1)!.value).toBe("2x2");
    expect(sheet.getCellInfoAt(1, 1)!.value).toBe("3x2");
    expect(sheet.getCellInfoAt(2, 1)).toBe(null);
  });

  it("Should delete empty column and reverse the insert operation", () => {
    sheet.insertColumn(0);
    sheet.deleteColumn(0);
    expect(sheet.getCellInfoAt(0, 0)!.value).toBe("1x1");
    expect(sheet.getCellInfoAt(1, 0)!.value).toBe("2x1");
    expect(sheet.getCellInfoAt(2, 0)!.value).toBe("3x1");
    expect(sheet.getCellInfoAt(0, 1)!.value).toBe("1x2");
    expect(sheet.getCellInfoAt(1, 1)!.value).toBe("2x2");
    expect(sheet.getCellInfoAt(2, 1)!.value).toBe("3x2");
  });

  it("Should delete the last column and not affect other columns", () => {
    sheet.setCellAt(0, 0, "");
    sheet.setCellAt(0, 1, "");
    sheet.deleteColumn(2);
    expect(sheet.getCellInfoAt(0, 0)).toBe(null);
    expect(sheet.getCellInfoAt(1, 0)!.value).toBe("2x1");
    expect(sheet.getCellInfoAt(2, 0)).toBe(null);
    expect(sheet.getCellInfoAt(0, 1)).toBe(null);
    expect(sheet.getCellInfoAt(1, 1)!.value).toBe("2x2");
    expect(sheet.getCellInfoAt(2, 1)).toBe(null);
  });
});
