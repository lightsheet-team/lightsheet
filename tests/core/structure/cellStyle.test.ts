import Sheet from "../../../src/core/structure/sheet.ts";
import CellStyle from "../../../src/core/structure/cellStyle.ts";
import { GroupTypes } from "../../../src/core/structure/sheet.types.ts";

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

    sheet.setCellCss(1, 1, styles[0].styling);
    expect(sheet.getMergedCellStyle(pos.columnKey, pos.rowKey).styling!).toEqual(styles[0].styling);

    sheet.setCellCss(1, 1, new Map());
    expect(sheet.getMergedCellStyle(pos.columnKey, pos.rowKey).styling).toEqual(
      sheet.defaultStyle.styling,
    );
    debugger
    sheet.setGroupCss(1, GroupTypes.Row, styles[1].styling);
    expect(sheet.getMergedCellStyle(pos.columnKey, pos.rowKey).styling).toEqual(styles[1].styling);

    sheet.setGroupCss(1!, GroupTypes.Column, styles[2].styling);
    expect(sheet.getMergedCellStyle(pos.columnKey, pos.rowKey).styling).toEqual(
      new CellStyle(
        new Map([
          ["width", "50px"],
          ["color", "0xff0000"],
        ]),
      ).styling,
    );

    sheet.setCellCss(1, 1, styles[3].styling);
    expect(sheet.getMergedCellStyle(pos.columnKey, pos.rowKey).styling).toEqual(
      new CellStyle(
        new Map([
          ["width", "50px"],
          ["color", "0xff0000"],
          ["border", "1px solid black"],
        ]),
      ).styling,
    );

    sheet.setCellCss(1, 1, new Map());
    sheet.setGroupCss(1, GroupTypes.Row, new Map());
    sheet.setGroupCss(1, GroupTypes.Column, new Map());
    expect(sheet.getMergedCellStyle(pos.columnKey, pos.rowKey).styling).toEqual(
      sheet.defaultStyle.styling,
    );
  });
});
