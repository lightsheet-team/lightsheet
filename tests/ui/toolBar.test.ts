import LightSheet from "../../src/main";

describe("Tool bar", () => {
  let targetElementMock;

  beforeEach(() => {
    targetElementMock = document.createElement("div");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should create toolbar with default value if there is no tool bar option", () => {
    // Get the toolbar element
    const toolBarElement = targetElementMock.querySelector(
      ".lightsheet_table_toolbar",
    );

    // Expect that the toolbar element exists
    expect(toolBarElement).toBeTruthy();
    // Expect that the toolbar element has 13 children
    expect(toolBarElement.children.length).toBe(13);
    // Expect that the toolbar element is initially hidden
    expect(toolBarElement.style.display).toBe("none");
  });

  test("should create toolbar inside the provided dom if element is provided", () => {
    // Create a mock toolbar DOM element
    const toolbarDomId = "toolbar-dom-id";
    const mockElement = document.createElement("div");
    mockElement.setAttribute("id", toolbarDomId);

    // Instantiate LightSheet with the provided mock element
    new LightSheet(targetElementMock, {
      data: [],
      columns: [],
      toolbarOptions: {
        element: mockElement,
      },
    });

    // Check if the toolbar is created inside the provided DOM element
    const toolbarElement = mockElement.querySelector(
      ".lightsheet_table_toolbar",
    );
    expect(toolbarElement).toBeTruthy();
  });

  test("should create toolbar as the first child in the table container if no element is provided", () => {
    // Get the toolbar element
    const toolBarElement = targetElementMock.querySelector(
      ".lightsheet_table_toolbar",
    );

    // Expect that the toolbar element exists and is the first child
    expect(toolBarElement).toBeTruthy();
    expect(targetElementMock.firstChild).toBe(toolBarElement);
  });

  test("should create items in toolbar from the constant file in the table container if no items provided", () => {
    const toolbarItems = []; // Replace with your toolbar items array

    // Get the toolbar element
    const toolBarElement = targetElementMock.querySelector(
      ".lightsheet_table_toolbar",
    );

    // Expect that the toolbar element has children based on toolbarItems array
    expect(toolBarElement.children.length).toBe(toolbarItems.length);
  });

  test("should create items in toolbar in the table container if items provided", () => {
    const toolbarItems = ["undo", "redo", "save"];

    // Get the toolbar element
    const toolBarElement = targetElementMock.querySelector(
      ".lightsheet_table_toolbar",
    );

    expect(toolBarElement.children.length).toBe(toolbarItems.length);
  });

  test("should show toolbar when showToolbar option is true", () => {
    // Get the toolbar element
    const toolBarElement = targetElementMock.querySelector(
      ".lightsheet_table_toolbar",
    );

    expect(toolBarElement.style.display).toBe("flex");
  });

  test("should hide toolbar when showToolbar option is false", () => {
    // Get the toolbar element
    const toolBarElement = targetElementMock.querySelector(
      ".lightsheet_table_toolbar",
    );

    expect(toolBarElement.style.display).toBe("none");
  });

  test("should hide toolbar when there is no show toolbar option", () => {
    // Get the toolbar element
    const toolBarElement = targetElementMock.querySelector(
      ".lightsheet_table_toolbar",
    );

    expect(toolBarElement.style.display).toBe("none");
  });
});
