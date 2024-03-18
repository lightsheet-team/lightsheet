import Sheet from "../../../src/core/structure/sheet.ts";

describe("Insert column test", () => {
  let sheet: Sheet;

  beforeEach(() => {
    sheet = new Sheet();
    sheet.setCellAt(1, 1, "1x1");
    sheet.setCellAt(2, 1, "2x1");
    sheet.setCellAt(3, 1, "3x1");
    sheet.setCellAt(1, 2, "1x2");
    sheet.setCellAt(2, 2, "2x2");
    sheet.setCellAt(3, 2, "3x2");
  });

  it("Insert column should shift the column correctly without losing any data", () => {
    console.log(sheet.exportData());
    sheet.insertColumn(1);
    console.log(sheet.exportData());
    expect(sheet.getCellValueAt(1, 1)).toBe(null);
    expect(sheet.getCellValueAt(2, 1)).toBe("1x1");
    expect(sheet.getCellValueAt(3, 1)).toBe("2x1");
    expect(sheet.getCellValueAt(4, 1)).toBe("3x1");
    expect(sheet.getCellValueAt(1, 2)).toBe(null);
    expect(sheet.getCellValueAt(2, 2)).toBe("1x2");
    expect(sheet.getCellValueAt(3, 2)).toBe("2x2");
    expect(sheet.getCellValueAt(4, 2)).toBe("3x2");
  });
});
