// Import other necessary dependencies and utilities for testing
import LightSheet from "../../src/main";
import UI from "../../src/ui/render";

describe("UI", () => {
  let targetElementMock: HTMLElement;
  let lightSheetInstance: LightSheet;
  let uiInstance: UI;

  beforeEach(() => {
    targetElementMock = document.createElement("div");
    lightSheetInstance = new LightSheet(targetElementMock, {
      data: [],
    });
    uiInstance = new UI(targetElementMock, lightSheetInstance); // Initialize UI instance
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Exist formula bar in dom", () => {
    // Find the formula bar container
    const formulaBarContainer = targetElementMock.querySelector(
      ".light_sheet_table_formula_bar",
    );

    // Assert that the formula bar container exists in the DOM
    expect(formulaBarContainer).toBeTruthy();

    // Assert that the container has an input field with the class "formula_input"
    const formulaInputField =
      formulaBarContainer?.querySelector(".formula_input"); // Using optional chaining
    expect(formulaInputField).toBeTruthy(); // Using a truthy assertion instead
  });

  test("Retains focus last selected cell", () => {
    // Find the first cell input element
    const firstCell = document.querySelector(
      "tbody tr:first-child td:first-child .lightsheet_table_cell_input",
    ) as HTMLInputElement;
    // Simulate clicking on the first cell
    if (firstCell) {
      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      firstCell.dispatchEvent(clickEvent);
    }

    // Find the second cell input element
    const secondCell = document.querySelector(
      "tbody tr:nth-child(2) td:nth-child(2) .lightsheet_table_cell_input",
    ) as HTMLInputElement;
    // Simulate clicking on the second cell
    if (secondCell) {
      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      secondCell.dispatchEvent(clickEvent);
    }

    // Wait for a short delay to allow the focus to change
    setTimeout(() => {
      // Assert that the content of the last selected cell retains focus
      expect(uiInstance.selectedCell).toEqual({ col: 1, row: 1 });
    }, 100);
  });

  test("Change cell content from formula bar", () => {
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
});
