import LightSheet from "../../src/main";

describe("Remove row in the UI", () => {
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

  it("should remove row from the UI", () => {
    // get the first row
    const firstRowElement = document.querySelector("tbody tr");
    const firstRowLabel = firstRowElement?.querySelector(
      ".lightsheet_table_row_number",
    );
    const A1Cell = firstRowElement?.querySelector(".lightsheet_table_cell ");
    expect(firstRowLabel!.innerHTML).toBe("1");
    expect((A1Cell?.children[0] as HTMLInputElement).value).toBe("A1");

    // select the row
    firstRowLabel?.dispatchEvent(new Event("click"));

    // press delete key
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Delete" }));

    // get the current first row
    const newFirstRowElement = document.querySelector("tbody tr");
    const newFirstRowLabel = firstRowElement?.querySelector(
      ".lightsheet_table_row_number",
    );
    const newA1Cell = newFirstRowElement?.querySelector(
      ".lightsheet_table_cell ",
    );
    expect(newFirstRowLabel!.innerHTML).toBe("1");
    expect((newA1Cell?.children[0] as HTMLInputElement).value).toBe("A2");
  });
});
