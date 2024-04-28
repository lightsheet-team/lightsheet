import LightSheet from "../main";
import { SelectionContainer } from "./render.types.ts";
import LightsheetEvent from "../core/event/event.ts";
import {
  CoreSetCellPayload,
  CoreSetStylePayload,
  IndexInfo,
  UISetCellPayload,
} from "../core/event/events.types.ts";
import EventType from "../core/event/eventType.ts";
import { ToolbarOptions } from "../main.types";
import { ToolbarItems } from "../utils/constants.ts";

export default class UI {
  tableEl: Element;
  toolbarDom: HTMLElement | undefined;
  formulaBarDom!: HTMLElement | null;
  formulaInput!: HTMLInputElement;
  selectedCellDisplay!: HTMLElement;
  tableHeadDom: Element;
  tableBodyDom: Element;
  lightSheet: LightSheet;
  selectedCell: number[];
  selectedRowNumberCell: HTMLElement | null = null;
  selectedHeaderCell: HTMLElement | null = null;
  selectedCellsContainer: SelectionContainer;
  toolbarOptions: ToolbarOptions;
  isReadOnly: boolean;
  singleSelectedCell: IndexInfo | undefined;
  tableContainerDom: any;

  constructor(
    el: Element,
    lightSheet: LightSheet,
    toolbarOptions?: ToolbarOptions,
  ) {
    this.tableEl = el;
    this.lightSheet = lightSheet;
    this.selectedCell = [];
    this.selectedCellsContainer = {
      selectionStart: null,
      selectionEnd: null,
    };
    this.singleSelectedCell = undefined;
    this.registerEvents();
    this.toolbarOptions = {
      showToolbar: false,
      element: undefined,
      items: ToolbarItems,
      ...toolbarOptions,
    };
    this.isReadOnly = lightSheet.options.isReadOnly || false;

    this.tableEl.classList.add("lightsheet_table_container");

    /*toolbar*/
    this.createToolbar();
    //formula bar
    this.createFormulaBar();

    //table
    this.tableContainerDom = document.createElement("table");
    this.tableContainerDom.classList.add("lightsheet_table");
    this.tableContainerDom.setAttribute("cellpadding", "0");
    this.tableContainerDom.setAttribute("cellspacing", "0");
    this.tableContainerDom.setAttribute("unselectable", "yes");
    this.tableEl.appendChild(this.tableContainerDom);

    //thead
    this.tableHeadDom = document.createElement("thead");
    this.tableContainerDom.appendChild(this.tableHeadDom);

    //tbody
    this.tableBodyDom = document.createElement("tbody");
    this.tableContainerDom.appendChild(this.tableBodyDom);
  }

  createToolbar() {
    if (
      !this.toolbarOptions.showToolbar ||
      this.toolbarOptions.items?.length == 0
    )
      return;
    //Element
    this.toolbarDom = document.createElement("div");
    this.toolbarDom.classList.add("lightsheet_table_toolbar");

    if (this.toolbarOptions.element != null) {
      this.toolbarOptions.element.appendChild(this.toolbarDom);
    } else {
      this.tableEl.insertBefore(this.toolbarDom, this.tableEl.firstChild);
    }

    for (let i = 0; i < this.toolbarOptions.items!.length; i++) {
      const toolbarItem = document.createElement("i");
      toolbarItem.classList.add("lightSheet_toolbar_item");
      toolbarItem.classList.add("material-symbols-outlined");
      toolbarItem.textContent = this.toolbarOptions.items![i];
      this.toolbarDom.appendChild(toolbarItem);
    }
  }

  removeToolbar() {
    if (this.toolbarDom) this.toolbarDom.remove();
  }

  showToolbar(isShown: boolean) {
    this.toolbarOptions.showToolbar = isShown;
    if (isShown) {
      this.createToolbar();
    } else {
      this.removeToolbar();
    }
  }

  createFormulaBar() {
    if (this.isReadOnly || this.formulaBarDom instanceof HTMLElement) {
      return;
    }
    this.formulaBarDom = document.createElement("div");
    this.formulaBarDom.classList.add("lightsheet_table_formula_bar");
    this.tableEl.insertBefore(this.formulaBarDom, this.tableContainerDom);
    //selected cell display element
    this.selectedCellDisplay = document.createElement("div");
    this.selectedCellDisplay.classList.add("lightsheet_selected_cell_display");
    this.formulaBarDom.appendChild(this.selectedCellDisplay);

    //"fx" label element
    const fxLabel = document.createElement("div");
    fxLabel.textContent = "fx";
    fxLabel.classList.add("lightsheet_fx_label");
    this.formulaBarDom.appendChild(fxLabel);

    //formula input
    this.formulaInput = document.createElement("input");
    this.formulaInput.classList.add("lightsheet_formula_input");
    this.formulaBarDom.appendChild(this.formulaInput);
    this.setFormulaBar();
  }

  setFormulaBar() {
    this.formulaInput.addEventListener("input", () => {
      const newValue = this.formulaInput.value;
      const selectedCellInput = document.querySelector(
        ".lightsheet_table_selected_cell input",
      ) as HTMLInputElement;
      if (selectedCellInput) {
        selectedCellInput.value = newValue;
      }
    });
    this.formulaInput.addEventListener("keyup", (event) => {
      const newValue = this.formulaInput.value;
      if (event.key === "Enter") {
        if (this.singleSelectedCell) {
          const colIndex = this.singleSelectedCell.columnIndex!;
          const rowIndex = this.singleSelectedCell.rowIndex!;
          this.onUICellValueChange(newValue, colIndex, rowIndex);
        }
        this.formulaInput.blur();
        const previouslySelectedCell = document.querySelector(
          ".lightsheet_table_selected_cell",
        );
        if (previouslySelectedCell) {
          previouslySelectedCell.classList.remove(
            "lightsheet_table_selected_cell",
          );
        }
      }
    });
    this.formulaInput.onblur = () => {
      const newValue = this.formulaInput.value;
      if (this.singleSelectedCell) {
        const colIndex = this.singleSelectedCell.columnIndex!;
        const rowIndex = this.singleSelectedCell.rowIndex!;
        this.onUICellValueChange(newValue, colIndex, rowIndex);
      }
    };
  }

  removeFormulaBar() {
    if (this.formulaBarDom) {
      this.formulaBarDom.remove();
      this.formulaBarDom = null;
    }
  }

  addHeader(headerData: string[]) {
    const headerRowDom = document.createElement("tr");
    this.tableHeadDom.appendChild(headerRowDom);

    for (let i = 0; i < headerData.length; i++) {
      const headerCellDom = document.createElement("td");
      headerCellDom.classList.add(
        "lightsheet_table_header",
        "lightsheet_table_td",
      );
      headerCellDom.textContent = headerData[i];
      headerRowDom.appendChild(headerCellDom);

      if (i > 0) {
        headerCellDom.onclick = (e: MouseEvent) => {
          const selectedColumn = e.target as HTMLElement;
          if (!selectedColumn) return;
          const prevSelection = this.selectedHeaderCell;
          this.removeGroupSelection();
          this.removeCellRangeSelection();

          if (prevSelection !== selectedColumn) {
            selectedColumn.classList.add(
              "lightsheet_table_selected_row_number_header_cell",
            );
            this.selectedHeaderCell = selectedColumn;
            Array.from(this.tableBodyDom.children).forEach((childElement) => {
              // Code inside the forEach loop
              childElement.children[i].classList.add(
                "lightsheet_table_selected_row_column",
              );
            });
          }
        };
      }
    }
  }

  createRowElement(labelCount: number): HTMLElement {
    const rowDom = document.createElement("tr");
    const rowNumberCell = document.createElement("td");
    rowNumberCell.innerHTML = `${labelCount + 1}`; // Row numbers start from 1
    rowNumberCell.classList.add(
      "lightsheet_table_row_number",
      "lightsheet_table_row_cell",
      "lightsheet_table_td",
    );
    rowDom.appendChild(rowNumberCell);
    rowNumberCell.onclick = (e: MouseEvent) => {
      const selectedRow = e.target as HTMLElement;
      if (!selectedRow) return;
      const prevSelection = this.selectedRowNumberCell;
      this.removeGroupSelection();
      this.removeCellRangeSelection();

      if (prevSelection !== selectedRow) {
        selectedRow.classList.add(
          "lightsheet_table_selected_row_number_header_cell",
        );
        this.selectedRowNumberCell = selectedRow;

        const parentElement = selectedRow.parentElement;
        if (parentElement) {
          for (let i = 1; i < parentElement.children.length; i++) {
            const childElement = parentElement.children[i];
            if (childElement !== selectedRow) {
              childElement.classList.add(
                "lightsheet_table_selected_row_column",
              );
            }
          }
        }
      }
    };
    return rowDom;
  }

  addRow(rowIndex: number): HTMLElement {
    const rowDom = this.createRowElement(rowIndex);
    rowDom.id = `row_${rowIndex}`;
    this.tableBodyDom.appendChild(rowDom);
    return rowDom;
  }

  getRowDom(rowIndex: number) {
    return this.tableBodyDom.children.length < rowIndex + 1 ? null : this.tableBodyDom.children[rowIndex]
  }

  addCell(
    colIndex: number,
    rowIndex: number,
    value: any,
  ): HTMLElement {
    const cellDom = document.createElement("td");
    cellDom.classList.add(
      "lightsheet_table_cell",
      "lightsheet_table_row_cell",
      "lightsheet_table_td",
    );
    const rowDom = this.tableBodyDom.children[rowIndex]
    rowDom.appendChild(cellDom);
    cellDom.id = `${colIndex}_${rowIndex}`;
    cellDom.setAttribute("column-index", `${colIndex}` || "");
    cellDom.setAttribute("row-index", `${rowIndex}` || "");

    const inputDom = document.createElement("input");
    inputDom.classList.add("lightsheet_table_cell_input");
    inputDom.value = "";
    inputDom.readOnly = this.isReadOnly;
    cellDom.appendChild(inputDom);

    if (value) {
      inputDom.value = value;
    }

    inputDom.addEventListener("input", (e: Event) => {
      const newValue = (e.target as HTMLInputElement).value;
      this.formulaInput.value = newValue;
    });

    inputDom.onchange = (e: Event) =>
      this.onUICellValueChange(
        (e.target as HTMLInputElement).value,
        colIndex,
        rowIndex,
      );

    inputDom.onfocus = () => {
      inputDom.value = inputDom.getAttribute("rawValue") ?? "";
      this.removeGroupSelection();
      this.removeCellRangeSelection();
      const previouslySelectedInput = document.querySelector(
        ".lightsheet_table_selected_cell",
      );
      if (previouslySelectedInput) {
        previouslySelectedInput.classList.remove(
          "lightsheet_table_selected_cell",
        );
      }

      cellDom.classList.add("lightsheet_table_selected_cell");
      if (colIndex !== undefined && rowIndex !== undefined) {
        this.selectedCell.push(colIndex, rowIndex);
      }

      this.singleSelectedCell = {
        columnIndex: Number(colIndex),
        rowIndex: Number(rowIndex),
      };

      if (this.formulaBarDom) {
        this.formulaInput.value = inputDom.getAttribute("rawValue")!;
      }
    };

    inputDom.onblur = () => {
      inputDom.value = inputDom.getAttribute("resolvedValue") ?? "";
    };

    inputDom.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        inputDom.blur();
        cellDom.classList.remove("lightsheet_table_selected_cell");
      }
    });

    inputDom.onmousedown = (e: MouseEvent) => {
      this.handleMouseDown(e, colIndex, rowIndex);
    };

    inputDom.onmouseover = (e: MouseEvent) => {
      if (e.buttons === 1) {
        this.handleMouseOver(e, colIndex, rowIndex);
      }
    };

    return cellDom;
  }

  setReadOnly(readonly: boolean) {
    const inputElements = this.tableBodyDom.querySelectorAll("input");
    inputElements.forEach((input) => {
      (input as HTMLInputElement).readOnly = readonly;
    });
    this.isReadOnly = readonly;
    if (readonly) {
      this.removeFormulaBar();
    } else {
      this.createFormulaBar();
    }
  }

  onUICellValueChange(rawValue: string, columnIndex: number, rowIndex: number) {
    const payload: UISetCellPayload = {
      indexInfo: { columnIndex, rowIndex },
      rawValue,
    };
    this.lightSheet.events.emit(
      new LightsheetEvent(EventType.UI_SET_CELL, payload),
    );
  }

  private registerEvents() {
    this.lightSheet.events.on(EventType.CORE_SET_CELL, (event) => {
      this.onCoreSetCell(event);
    });
    this.lightSheet.events.on(EventType.VIEW_SET_STYLE, (event) => {
      this.onCoreSetStyle(event.payload);
    });
  }

  private onCoreSetStyle(event: CoreSetStylePayload) {
    const { indexInfo, value } = event;
    if (indexInfo.columnIndex != undefined && indexInfo.rowIndex != undefined) {
      const cellDom =
        this.tableBodyDom.children[indexInfo.rowIndex].children[
        indexInfo.columnIndex + 1
        ];
      const inputElement = cellDom! as HTMLElement;
      inputElement.setAttribute("style", value);
    } else if (indexInfo.columnIndex || indexInfo.columnIndex === 0) {
      for (let i = 0; i < this.tableBodyDom.children.length; i++) {
        this.tableBodyDom.children[i].children[
          indexInfo.columnIndex + 1
        ].setAttribute("style", value);
      }
    } else {
      for (
        let i = 1;
        i < this.tableBodyDom.children[indexInfo.rowIndex!].children.length;
        i++
      ) {
        this.tableBodyDom.children[indexInfo.rowIndex!].children[
          i
        ].setAttribute("style", value);
      }
    }
  }

  private onCoreSetCell(event: LightsheetEvent) {
    const payload = event.payload as CoreSetCellPayload;
    let cellDom;
    const columnIndex = payload.indexInfo.columnIndex!
    const rowIndex = payload.indexInfo.rowIndex!;
    if (this.tableBodyDom.children.length < rowIndex + 1) {
      this.addRow(rowIndex)
      cellDom = this.addCell(columnIndex, rowIndex, payload.formattedValue)
    } else {
      if (this.tableBodyDom.children[rowIndex].children.length < columnIndex + 2) {
        cellDom = this.addCell(columnIndex, rowIndex, payload.formattedValue)
      }
      else cellDom = this.tableBodyDom.children[rowIndex].children[columnIndex + 1]
    }
    const inputEl = cellDom.firstChild! as HTMLInputElement;
    inputEl.setAttribute("rawValue", payload.rawValue);
    inputEl.setAttribute("resolvedValue", payload.formattedValue);
    inputEl.value = payload.formattedValue;
  }

  removeGroupSelection() {
    this.removeColumnSelection();
    this.removeRowSelection();
  }

  removeRowSelection() {
    if (!this.selectedRowNumberCell) return;

    this.selectedRowNumberCell.classList.remove(
      "lightsheet_table_selected_row_number_header_cell",
    );
    const parentElement = this.selectedRowNumberCell.parentElement;
    if (parentElement) {
      for (let i = 1; i < parentElement.children.length; i++) {
        const childElement = parentElement.children[i];
        if (childElement !== this.selectedRowNumberCell) {
          childElement.classList.remove("lightsheet_table_selected_row_column");
        }
      }
    }

    this.selectedRowNumberCell = null;
  }

  removeColumnSelection() {
    if (!this.selectedHeaderCell) return;

    this.selectedHeaderCell.classList.remove(
      "lightsheet_table_selected_row_number_header_cell",
    );
    for (const childElement of this.tableBodyDom.children) {
      Array.from(childElement.children).forEach((element: Element) => {
        element.classList.remove("lightsheet_table_selected_row_column");
      });
    }

    this.selectedHeaderCell = null;
  }

  removeCellRangeSelection() {
    const cells = Array.from(document.querySelectorAll("td"));
    cells.forEach((cell) =>
      cell.classList.remove("lightsheet_table_selected_cell_range"),
    );
  }

  cellInRange(cell: HTMLTableCellElement) {
    const { selectionStart, selectionEnd } = this.selectedCellsContainer;
    if (!selectionStart || !selectionEnd) {
      return false;
    }

    const cellColumnIndex = Number(cell.getAttribute("column-index"));
    const cellRowIndex = Number(cell.getAttribute("row-index"));

    if (cellColumnIndex === undefined || cellRowIndex === undefined)
      return false;

    const withinX =
      (cellColumnIndex >= selectionStart.column &&
        cellColumnIndex <= selectionEnd.column) ||
      (cellColumnIndex <= selectionStart.column &&
        cellColumnIndex >= selectionEnd.column);
    const withinY =
      (cellRowIndex >= selectionStart.row &&
        cellRowIndex <= selectionEnd.row) ||
      (cellRowIndex <= selectionStart.row && cellRowIndex >= selectionEnd.row);

    return withinX && withinY;
  }

  updateSelection() {
    this.removeCellRangeSelection();
    const cells = Array.from(document.querySelectorAll("td"));
    cells.forEach((cell) => {
      if (
        cell.classList.contains("lightsheet_table_header") ||
        cell.classList.contains("lightsheet_table_row_number")
      )
        return;

      if (this.cellInRange(cell)) {
        cell.classList.add("lightsheet_table_selected_cell_range");
      }
    });
  }

  handleMouseDown(e: MouseEvent, colIndex: number, rowIndex: number) {
    if (e.button === 0) {
      this.selectedCellsContainer.selectionStart =
        (colIndex != null || undefined) && (rowIndex != null || undefined)
          ? {
            row: rowIndex,
            column: colIndex,
          }
          : null;
    }
  }

  handleMouseOver(e: MouseEvent, colIndex: number, rowIndex: number) {
    if (e.button !== 0) return;

    this.selectedCellsContainer.selectionEnd =
      (colIndex != null || undefined) && (rowIndex != null || undefined)
        ? {
          row: rowIndex,
          column: colIndex,
        }
        : null;
    if (
      this.selectedCellsContainer.selectionStart &&
      this.selectedCellsContainer.selectionEnd &&
      this.selectedCellsContainer.selectionStart !==
      this.selectedCellsContainer.selectionEnd
    ) {
      this.updateSelection();
    }
  }
}
