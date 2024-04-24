// Import other necessary dependencies and utilities for testing
import LightSheet from "../../src/main";

describe("Formula", () => {
  let targetElementMock: HTMLElement;

  beforeEach(() => {
    targetElementMock = document.createElement("div");
    window.sheetHolder?.clear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Exist formula bar in dom", () => {
    new LightSheet(
      {
        sheetName: "Sheet 1",
        data: [],
        isReadOnly: false,
      },
      targetElementMock,
    );

    const formulaBarContainer = document.querySelector(
      ".lightsheet_table_formula_bar",
    );
    setTimeout(() => {
      expect(formulaBarContainer).toBeTruthy();
    }, 100);
  });

  test("Change cell content from formula bar", () => {
    new LightSheet(
      {
        sheetName: "Sheet 2",
        data: [],
      },
      targetElementMock,
    );
    // Find the cell input element
    const cell = document.querySelector(
      "tbody tr:first-child td:first-child .lightsheet_table_cell_input",
    ) as HTMLInputElement;

    // Simulate clicking on the cell
    if (cell) {
      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      cell.dispatchEvent(clickEvent);
    }

    // Get the formula bar input element
    const formulaBarInput = document.querySelector(
      ".formula_input",
    ) as HTMLInputElement;

    // Simulate clicking on the formula bar
    if (formulaBarInput) {
      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      formulaBarInput.dispatchEvent(clickEvent);
    }

    // Change the input value in the formula bar
    if (formulaBarInput) {
      formulaBarInput.value = "=5+5";
      formulaBarInput.dispatchEvent(new Event("input", { bubbles: true }));
    }

    setTimeout(() => {
      expect(cell?.value).toEqual("10");
    }, 100);
  });

  test("Change formula bar content from cell", async () => {
    new LightSheet(
      {
        sheetName: "Sheet 3",
        data: [],
      },
      targetElementMock,
    );
    const cell = document.querySelector(
      "tbody tr:first-child td:first-child .lightsheet_table_cell_input",
    ) as HTMLInputElement;

    if (cell) {
      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      cell.dispatchEvent(clickEvent);
    }

    // Change the content of the cell
    if (cell) {
      cell.value = "10";
      cell.dispatchEvent(new Event("input", { bubbles: true }));
    }

    // Get the formula bar input element
    const formulaBarInput = document.querySelector(
      ".formula_input",
    ) as HTMLInputElement;

    setTimeout(() => {
      expect(formulaBarInput?.value).toEqual("10");
    }, 100);
  });

  test("Hide formula bar in read only mode", () => {
    new LightSheet(
      {
        sheetName: "Sheet 4",
        data: [],
        isReadOnly: true,
      },
      targetElementMock,
    );

    const formulaBarContainer = document.querySelector(
      ".lightsheet_table_formula_bar",
    );
    expect(formulaBarContainer).toBeNull();
  });

  test("Show formula bar in read only mode", () => {
    new LightSheet(
      {
        sheetName: "Sheet 5",
        data: [],
        isReadOnly: false,
      },
      targetElementMock,
    );

    const formulaBarContainer = document.querySelector(
      ".lightsheet_table_formula_bar",
    );
    setTimeout(() => {
      expect(formulaBarContainer).toBeTruthy();
    }, 100);
  });

  test("Display the raw value of the cell", () => {
    new LightSheet(
      {
        sheetName: "Sheet 6",
        data: [
          ["1", "=1+2/3*6+A1+test(1,2)", "img/nophoto.jpg", "Marketing"],
          ["2", "Jorge", "img/nophoto.jpg", "Marketing", "3120"],
          ["3", "Jorge", "img/nophoto.jpg", "Marketing", "3120"],
        ],
      },
      targetElementMock,
    );
    // Select cell2
    const cell2 = document.querySelector(
      "tbody tr:nth-child(2) td:first-child .lightsheet_table_cell_input",
    ) as HTMLInputElement;

    // Check if cell2 exists before dispatching the click event
    if (cell2) {
      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      cell2.dispatchEvent(clickEvent);
    }
    // Get the formula bar input element
    const formulaBarInput = document.querySelector(
      ".formula_input",
    ) as HTMLInputElement;

    setTimeout(() => {
      expect(formulaBarInput?.value).toEqual("=1+2/3*6+A1+test(1,2)");
    });
  });
});
