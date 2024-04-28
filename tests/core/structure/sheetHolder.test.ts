import Lightsheet from "../../../src/main.ts";

describe("Multiple sheets test", () => {
  beforeEach(() => {
    window.sheetHolder?.clear();
    for (let i = 0; i < 2; i++) {
      new Lightsheet({ data: [], sheetName: `Sheet${i + 1}` });
    }
  });

  it("should find the global SheetHolder object and all initialized sheets", () => {
    expect(window.sheetHolder).toBeDefined();
    for (let i = 0; i < 2; i++) {
      expect(window.sheetHolder.getSheetByName(`Sheet${i + 1}`)).toBeDefined();
    }
  });

  it("should resolve a single cross-sheet cell reference", () => {
    // Reference from Sheet 2 A1 to Sheet 1 A1
    const sheet1 = window.sheetHolder.getSheetByName("Sheet1")!;
    const sheet2 = window.sheetHolder.getSheetByName("Sheet2")!;

    sheet1.setCellAt(0, 0, "10");
    sheet2.setCellAt(0, 0, "=Sheet1!A1");

    expect(sheet2.getCellInfoAt(0, 0)!.resolvedValue).toBe("10");
  });

  it("should resolve a cross-sheet cell range sum", () => {
    const sheet1 = window.sheetHolder.getSheetByName("Sheet1")!;
    const sheet2 = window.sheetHolder.getSheetByName("Sheet2")!;

    sheet1.setCellAt(0, 0, "10");
    sheet1.setCellAt(1, 0, "20");
    sheet1.setCellAt(0, 1, "30");
    sheet2.setCellAt(0, 0, "=sum(Sheet1!A1:B2)");

    expect(sheet2.getCellInfoAt(0, 0)!.resolvedValue).toBe("60");
    sheet2.setCellAt(0, 0, "");
  });

  it("should create and delete a cross-sheet range reference to empty cells", () => {
    const sheet1 = window.sheetHolder.getSheetByName("Sheet1")!;
    const sheet2 = window.sheetHolder.getSheetByName("Sheet2")!;

    const outInfo = sheet1.setCellAt(0, 0, "=Sheet2!A1:E5");
    const refSize = { col: 5, row: 5 };

    const outCellKey = sheet1
      .columns!.get(outInfo!.position.columnKey!)!
      .cellIndex.get(outInfo!.position.rowKey!)!;
    const outCell = sheet1.cellData.get(outCellKey)!;

    // Check referencesIn and referencesOut
    expect(outCell.referencesOut.size).toBe(refSize.col * refSize.row);
    outCell.referencesOut.forEach((ref, refCellKey) => {
      const refSheet = window.sheetHolder.getSheet(ref.sheetKey)!;
      expect(refSheet.cellData.get(refCellKey)!.referencesIn.size).toBe(1);
    });

    // Clear referencing formula.
    sheet1.setCellAt(0, 0, ":)");

    // ReferencesOut should be empty now.
    expect(outCell.referencesOut.size).toBe(0);

    // Referred cells shouldn't exist anymore.
    for (let i = 0; i < refSize.col * refSize.row; i++) {
      const col = i % refSize.col;
      const row = Math.floor(i / refSize.row);
      expect(sheet2.getCellInfoAt(col, row)).toBeNull();
    }
  });
});
