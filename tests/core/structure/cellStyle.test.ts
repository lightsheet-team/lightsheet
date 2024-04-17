import Sheet from "../../../src/core/structure/sheet.ts";
import CellStyle from "../../../src/core/structure/cellStyle.ts";

describe("CellStyle", () => {
  let sheet: Sheet;

  beforeEach(() => {
    window.sheetHolder?.clear();
    sheet = new Sheet("Sheet");
  });

  it("should apply cell styling rules that are properly combined by getCellStyle", () => {
    const pos = sheet.setCellAt(1, 1, "test")!.position;
    sheet.defaultStyle = new CellStyle();

    const styles = [
      new CellStyle(
        new Map([
          ["width", "30px"],
          ["height", "50px"],
        ]),
      ),
      new CellStyle(new Map([["width", "50px"]])),
      new CellStyle(new Map([["color", "0xff0000"]])),
      new CellStyle(new Map([["border", "1px solid black"]])),
    ];

    sheet.setCellStyle(pos.columnKey!, pos.rowKey!, styles[0]);
    expect(sheet.getCellStyle(pos.columnKey!, pos.rowKey!)!).toEqual(styles[0]);

    sheet.setCellStyle(pos.columnKey!, pos.rowKey!, null);
    expect(sheet.getCellStyle(pos.columnKey!, pos.rowKey!)).toEqual(
      sheet.defaultStyle,
    );

    sheet.setRowStyle(pos.rowKey!, styles[1]);
    expect(sheet.getCellStyle(pos.columnKey!, pos.rowKey!)!).toEqual(styles[1]);

    sheet.setColumnStyle(pos.columnKey!, styles[2]);
    expect(sheet.getCellStyle(pos.columnKey!, pos.rowKey!)!).toEqual(
      new CellStyle(
        new Map([
          ["width", "50px"],
          ["color", "0xff0000"],
        ]),
      ),
    );

    sheet.setCellStyle(pos.columnKey!, pos.rowKey!, styles[3]);
    expect(sheet.getCellStyle(pos.columnKey!, pos.rowKey!)!).toEqual(
      new CellStyle(
        new Map([
          ["width", "50px"],
          ["color", "0xff0000"],
          ["border", "1px solid black"],
        ]),
      ),
    );

    sheet.setCellStyle(pos.columnKey!, pos.rowKey!, null);
    sheet.setRowStyle(pos.rowKey!, null);
    sheet.setColumnStyle(pos.columnKey!, null);
    expect(sheet.getCellStyle(pos.columnKey!, pos.rowKey!)).toEqual(
      sheet.defaultStyle,
    );
  });
});
