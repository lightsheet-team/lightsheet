import LightSheet from "../../src/main";
import { ToolbarItems } from "../../src/utils/constants.ts";

describe("Tool bar", () => {
  beforeEach(() => {
    window.sheetHolder?.clear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should create toolbar as the first child in the table container if no element is provided", () => {
    const targetElementMock: HTMLElement = document.createElement("div");
    document.body.appendChild(targetElementMock);

    // Get the toolbar element
    new LightSheet(
      {
        sheetName: "Sheet",
        toolbarOptions: { showToolbar: true },
      },
      targetElementMock,
    );

    const toolBarElement = targetElementMock.querySelector(
      ".lightsheet_table_toolbar",
    );

    // Expect that the toolbar element exists and is the first child
    expect(toolBarElement).toBeTruthy();
    expect(targetElementMock.firstChild).toBe(toolBarElement);
  });

  test("should create items in toolbar from the constant file in the table container if no items provided", () => {
    const targetElementMock: HTMLElement = document.createElement("div");

    new LightSheet(
      {
        sheetName: "Sheet",
        toolbarOptions: { showToolbar: true },
      },
      targetElementMock,
    );
    // Get the toolbar element
    const toolBarElement = targetElementMock.querySelector(
      ".lightsheet_table_toolbar",
    );

    // Expect that the toolbar element has children based on toolbarItems array
    expect(toolBarElement!.children.length).toBe(ToolbarItems.length);
  });

  test("should create items in toolbar in the table container if items provided", () => {
    const toolbarItems = ["undo", "redo", "save"];
    const targetElementMock: HTMLElement = document.createElement("div");

    new LightSheet(
      {
        sheetName: "Sheet",
        toolbarOptions: {
          showToolbar: true,
          items: toolbarItems,
        },
      },
      targetElementMock,
    );
    // Get the toolbar element
    const toolBarElement = targetElementMock.querySelector(
      ".lightsheet_table_toolbar",
    );

    expect(toolBarElement!.children.length).toBe(toolbarItems.length);
  });

  test("should show toolbar when showToolbar option is true", () => {
    const targetElementMock: HTMLElement = document.createElement("div");

    new LightSheet(
      {
        sheetName: "Sheet",
        toolbarOptions: {
          showToolbar: true,
        },
      },
      targetElementMock,
    );

    // Get the toolbar element
    const toolBarElement = targetElementMock.querySelector(
      ".lightsheet_table_toolbar",
    );

    expect(toolBarElement).toBeDefined();
  });

  test("should hide toolbar when showToolbar option is false", () => {
    const targetElementMock: HTMLElement = document.createElement("div");

    new LightSheet(
      {
        sheetName: "Sheet",
        toolbarOptions: {
          showToolbar: false,
        },
      },
      targetElementMock,
    );
    // Get the toolbar element
    const toolBarElement = targetElementMock.querySelector(
      ".lightsheet_table_toolbar",
    );

    expect(toolBarElement).toBeFalsy();
  });

  test("should hide toolbar when there is no show toolbar option", () => {
    const targetElementMock: HTMLElement = document.createElement("div");

    new LightSheet({ sheetName: "Sheet" }, targetElementMock);
    // Get the toolbar element
    const toolBarElement = targetElementMock.querySelector(
      ".lightsheet_table_toolbar",
    );

    expect(toolBarElement).toBeFalsy();
  });
});
