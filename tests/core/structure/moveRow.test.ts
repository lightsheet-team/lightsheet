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
    sheet.moveRow(0, 2);
    expect(sheet.getCellInfoAt(0, 0)!.value).toBe("1x2");
    expect(sheet.getCellInfoAt(1, 0)!.value).toBe("2x2");

    expect(sheet.getCellInfoAt(0, 1)!.value).toBe("1x3");
    expect(sheet.getCellInfoAt(1, 1)!.value).toBe("2x3");

    expect(sheet.getCellInfoAt(0, 2)!.value).toBe("1x1");
    expect(sheet.getCellInfoAt(1, 2)!.value).toBe("2x1");
  });

  it("should move row left and shift the other rows correctly", () => {
    sheet.moveRow(2, 0);
    expect(sheet.getCellInfoAt(0, 0)!.value).toBe("1x3");
    expect(sheet.getCellInfoAt(1, 0)!.value).toBe("2x3");

    expect(sheet.getCellInfoAt(0, 1)!.value).toBe("1x1");
    expect(sheet.getCellInfoAt(1, 1)!.value).toBe("2x1");

    expect(sheet.getCellInfoAt(0, 2)!.value).toBe("1x2");
    expect(sheet.getCellInfoAt(1, 2)!.value).toBe("2x2");
  });
});
