import Sheet from "../../../src/core/structure/sheet.ts";
import CellStyle from "../../../src/core/structure/cellStyle.ts";
import NumberFormatter from "../../../src/core/evaluation/numberFormatter.ts";
import { CellState } from "../../../src/core/structure/cell/cellState.ts";

describe("Formatter test", () => {
  let sheet: Sheet;

  beforeEach(() => {
    window.sheetHolder?.clear();
    sheet = new Sheet("Sheet");
    sheet.setCellAt(0, 0, "ABC"); // A1
    sheet.setCellAt(0, 1, "12.3"); // A2
    sheet.setCellAt(1, 0, "3,14"); // B1
    sheet.setCellAt(1, 1, "=3/4"); // B2
    sheet.setCellAt(2, 0, "3.14"); // C1
    sheet.setCellAt(2, 1, "=A2"); // C2
  });

  it("Should round a fraction correctly", () => {
    const oneDigit = new CellStyle(null, new NumberFormatter(1));
    sheet.setColumnFormatter(1, oneDigit.formatter);
    expect(sheet.getCellInfoAt(1, 1)!.formattedValue).toBe("0.8");
  });

  it("Should apply two different formatting rules to the same cell value", () => {
    const noDigits = new CellStyle(null, new NumberFormatter(0));
    const twoDigits = new CellStyle(null, new NumberFormatter(2));

    sheet.setColumnFormatter(1, noDigits.formatter);
    sheet.setColumnFormatter(2, twoDigits.formatter);

    expect(sheet.getCellInfoAt(1, 1)!.formattedValue).toBe("12");
    expect(sheet.getCellInfoAt(2, 1)!.formattedValue).toBe("12.30");
  });

  it("Should format a string value as a number and result in an invalid cell state", () => {
    const style = new CellStyle(null, new NumberFormatter(0));
    sheet.setColumnFormatter(0, style.formatter);

    expect(sheet.getCellInfoAt(0, 0)!.state).toBe(CellState.INVALID_FORMAT);
  });
});
