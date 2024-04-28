import Sheet from "../../../src/core/structure/sheet.ts";
import Lightsheet from "../../../src/main.ts";
import SheetHolder from "../../../src/core/structure/sheetHolder.ts";
import { CellReference } from "../../../src/core/structure/cell/types.cell.ts";

describe("Custom formula function test", () => {
  let sheet: Sheet;

  beforeEach(() => {
    window.sheetHolder?.clear();
    sheet = new Sheet("Sheet");
    sheet.setCellAt(0, 0, "1"); // A1
    sheet.setCellAt(1, 0, "2"); // B1
    sheet.setCellAt(0, 1, "3"); // A2
    sheet.setCellAt(1, 1, "4"); // B2
    sheet.setCellAt(0, 2, "5"); // A3
    sheet.setCellAt(1, 2, "6"); // B3

    Lightsheet.registerFunction("concat", (_, values: string[]) =>
      values.join(""),
    );

    Lightsheet.registerFunction(
      "spread",
      (cellPos: CellReference, value: string) => {
        const sheet = SheetHolder.getInstance().getSheet(cellPos.sheetKey)!;
        const colPos = sheet.getColumnIndex(cellPos.column)! + 1;
        const rowPos = sheet.getRowIndex(cellPos.row)!;
        for (let i = colPos; i < colPos + value.length; i++) {
          sheet.setCellAt(i, rowPos, value[i - colPos]);
        }
        return value;
      },
    );
  });

  it("should combine all cells' values with concat", () => {
    sheet.setCellAt(2, 0, "=concat(A1:B3)");
    expect(sheet.getCellInfoAt(2, 0)?.resolvedValue).toBe("123456");
  });

  it("should use the spread function to manipulate cells in other columns", () => {
    sheet.setCellAt(2, 1, '=spread("HI :)")');
    expect(sheet.getCellInfoAt(3, 1)?.resolvedValue).toBe("H");
    expect(sheet.getCellInfoAt(4, 1)?.resolvedValue).toBe("I");
    expect(sheet.getCellInfoAt(5, 1)?.resolvedValue).toBe(" ");
    expect(sheet.getCellInfoAt(6, 1)?.resolvedValue).toBe(":");
    expect(sheet.getCellInfoAt(7, 1)?.resolvedValue).toBe(")");
  });
});
