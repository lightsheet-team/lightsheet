import LightSheet from "../../src/main";

describe("Remove column in the UI", () => {
  let lightSheet: LightSheet;
  let targetElementMock: HTMLElement;

  beforeEach(() => {
    // Mocking UI and target element
    targetElementMock = document.createElement("div");
    document.body.appendChild(targetElementMock);

    // Creating instance of LightSheet
    lightSheet = new LightSheet(
      {
        sheetName: "Sheet",
      },
      targetElementMock,
    );
    lightSheet.setCellAt(0, 0, "A1");
    lightSheet.setCellAt(1, 0, "B1");
    lightSheet.setCellAt(0, 1, "A2");
    lightSheet.setCellAt(1, 1, "B2");
  });

  it("should remove column from the UI", () => {
    // get the first column
    const firstColumnLabel = document?.querySelector(
      ".lightsheet_table_header ",
    );
    const A1Cell = document?.querySelector(".lightsheet_table_cell");
    expect(firstColumnLabel!.innerHTML).toBe("A");
    expect((A1Cell?.children[0] as HTMLInputElement).value).toBe("A1");

    // select the row
    firstColumnLabel?.dispatchEvent(new Event("click"));

    // press delete key
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Delete" }));

    // get the current first row
    const newFirstColumnLabel = document?.querySelector(
      ".lightsheet_table_header ",
    );
    const newA1Cell = document?.querySelector(".lightsheet_table_cell");

    expect(newFirstColumnLabel!.innerHTML).toBe("A");
    expect((newA1Cell?.children[0] as HTMLInputElement).value).toBe("B1");
  });
});
