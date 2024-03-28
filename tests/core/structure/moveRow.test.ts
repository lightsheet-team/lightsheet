import Sheet from "../../../src/core/structure/sheet.ts";

describe("move row test", () => {
  let sheet: Sheet;

  beforeEach(() => {
    sheet = new Sheet();
    sheet.setCellAt(0, 0, "1x1");
    sheet.setCellAt(1, 0, "2x1");

    sheet.setCellAt(0, 1, "1x2");
    sheet.setCellAt(1, 1, "2x2");

    sheet.setCellAt(0, 2, "1x3");
    sheet.setCellAt(1, 2, "2x3");
  });

  it("should move row right and shift the other rows correctly", () => {
    console.log(sheet.exportData());
    sheet.moveRow(0, 2);
    console.log(sheet.exportData());
    expect(sheet.getCellValueAt(0, 0)).toBe("1x2");
    expect(sheet.getCellValueAt(1, 0)).toBe("2x2");

    expect(sheet.getCellValueAt(0, 1)).toBe("1x3");
    expect(sheet.getCellValueAt(1, 1)).toBe("2x3");

    expect(sheet.getCellValueAt(0, 2)).toBe("1x1");
    expect(sheet.getCellValueAt(1, 2)).toBe("2x1");
  });

  it("should move row left and shift the other rows correctly", () => {
    console.log(sheet.exportData());
    sheet.moveRow(2, 0);
    console.log(sheet.exportData());
    expect(sheet.getCellValueAt(0, 0)).toBe("1x3");
    expect(sheet.getCellValueAt(1, 0)).toBe("2x3");

    expect(sheet.getCellValueAt(0, 1)).toBe("1x1");
    expect(sheet.getCellValueAt(1, 1)).toBe("2x1");

    expect(sheet.getCellValueAt(0, 2)).toBe("1x2");
    expect(sheet.getCellValueAt(1, 2)).toBe("2x2");
  });
});
