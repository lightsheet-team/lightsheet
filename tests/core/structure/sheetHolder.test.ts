import LightSheet from "../../../src/main.ts";
import SheetHolder from "../../../src/core/structure/sheetHolder.ts";

describe("Multiple sheet test", () => {
  let targetMocks: HTMLElement[];

  beforeEach(() => {
    window.sheetHolder?.clear();
    targetMocks = [
      document.createElement("div"),
      document.createElement("div"),
    ];

    for (let i = 0; i < targetMocks.length; i++) {
      new LightSheet({ data: [], sheetName: `Sheet${i + 1}` }, targetMocks[i]);
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should call the SheetHolder constructor without effect", () => {
    const holder = window.sheetHolder;
    expect(holder).toBeDefined();
    const dummyHolder = new SheetHolder();
    expect(dummyHolder).toBe(holder);
  });

  it("should find the global SheetHolder object and all initialized sheets", () => {
    expect(window.sheetHolder).toBeDefined();
    for (let i = 0; i < targetMocks.length; i++) {
      expect(window.sheetHolder.getSheetByName(`Sheet${i + 1}`)).toBeDefined();
    }
  });

  it("should resolve a single cross-sheet cell reference", () => {
    // Reference from Sheet 2 A1 to Sheet 1 A1
    const sheet1 = window.sheetHolder.getSheetByName("Sheet1")!.sheet;
    const sheet2 = window.sheetHolder.getSheetByName("Sheet2")!.sheet;

    sheet1?.setCellAt(0, 0, "10");
    sheet2?.setCellAt(0, 0, "=Sheet1!A1");

    expect(sheet2.getCellInfoAt(0, 0)!.resolvedValue).toBe("10");
  });
});
