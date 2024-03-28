import Sheet from "../../../src/core/structure/sheet.ts";

describe("Insert column test", () => {
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

  it("Should insert column and shift the other columns correctly", () => {
    console.log(sheet.exportData());
    sheet.insertColumn(0);
    console.log(sheet.exportData());
    expect(sheet.getCellValueAt(0, 0)).toBe(null);
    expect(sheet.getCellValueAt(1, 0)).toBe("1x1");
    expect(sheet.getCellValueAt(2, 0)).toBe("2x1");
    expect(sheet.getCellValueAt(3, 0)).toBe("3x1");
    expect(sheet.getCellValueAt(0, 1)).toBe(null);
    expect(sheet.getCellValueAt(1, 1)).toBe("1x2");
    expect(sheet.getCellValueAt(2, 1)).toBe("2x2");
    expect(sheet.getCellValueAt(3, 1)).toBe("3x2");
  });
});
