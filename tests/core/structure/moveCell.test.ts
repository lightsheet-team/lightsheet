import Sheet from "../../../src/core/structure/sheet.ts";
import CellStyle from "../../../src/core/structure/cellStyle.ts";

describe("Cell moving tests", () => {
  let sheet: Sheet;

  beforeEach(() => {
    window.sheetHolder?.clear();
    sheet = new Sheet("Sheet");
    sheet.setCellAt(0, 0, "1");
    sheet.setCellAt(0, 1, "2");
    sheet.setCellAt(0, 2, "3");

    sheet.setCellAt(1, 0, "=A1");
    sheet.setCellAt(1, 1, "=A2");
    sheet.setCellAt(1, 2, "=A3");

    sheet.setCellAt(2, 0, "=B1");
    sheet.setCellAt(2, 1, "=B2");
    sheet.setCellAt(2, 2, "=B3");
  });

  it("should move a single cell and not invalidate incoming references", () => {
    sheet.moveCell({ column: 0, row: 0 }, { column: 3, row: 3 });
    const referringCell = sheet.getCellInfoAt(1, 0);
    expect(sheet.getCellInfoAt(0, 0)).toBe(null);
    expect(referringCell!.resolvedValue).toBe("1");
    expect(referringCell!.rawValue).toBe("=D4");
  });

  it("should move multiple cells and not invalidate references", () => {
    sheet.moveCell({ column: 0, row: 0 }, { column: 3, row: 0 });
    sheet.moveCell({ column: 1, row: 1 }, { column: 4, row: 1 });
    sheet.moveCell({ column: 2, row: 2 }, { column: 5, row: 2 });

    expect(sheet.getCellInfoAt(0, 0)).toBe(null);
    expect(sheet.getCellInfoAt(1, 0)?.rawValue).toBe("=D1");

    expect(sheet.getCellInfoAt(1, 1)).toBe(null);
    expect(sheet.getCellInfoAt(4, 1)?.rawValue).toBe("=A2");
    expect(sheet.getCellInfoAt(2, 1)?.rawValue).toBe("=E2");

    expect(sheet.getCellInfoAt(2, 2)).toBe(null);
    expect(sheet.getCellInfoAt(5, 2)?.rawValue).toBe("=B3");
  });

  it("should move a single cell with its styling", () => {
    const style = new CellStyle(new Map([["color", "red"]]));
    const fromCell = sheet.getCellInfoAt(0, 0)!;
    sheet.setCellCss(0, 0, style.styling);

    sheet.moveCell({ column: 0, row: 0 }, { column: 3, row: 3 });
    expect(
      sheet.getCellStyle(
        fromCell.position.columnKey!,
        fromCell.position.rowKey!,
      ),
    ).toEqual(sheet.defaultStyle);

    const toCell = sheet.getCellInfoAt(3, 3)!;
    expect(
      sheet.getCellStyle(toCell.position.columnKey!, toCell.position.rowKey!),
    ).toEqual(style);
  });
});
