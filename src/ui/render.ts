import { SelectionContainer } from "./render.types.ts";
import LightsheetEvent from "../core/event/event.ts";
import {
  CoreSetCellPayload,
  UISetCellPayload,
} from "../core/event/events.types.ts";
import EventType from "../core/event/eventType.ts";
import { LightsheetOptions, ToolbarOptions } from "../main.types";
import LightsheetHelper from "../utils/helpers.ts";
import { ToolbarItems } from "../utils/constants.ts";
import { Coordinate } from "../utils/common.types.ts";
import Events from "../core/event/events.ts";

export default class UI {
  tableEl!: Element;
  toolbarDom: HTMLElement | undefined;
  formulaBarDom!: HTMLElement | null;
  formulaInput!: HTMLInputElement;
  selectedCellDisplay!: HTMLElement;
  tableHeadDom!: Element;
  tableBodyDom!: Element;
  selectedCell: number[];
  selectedRowNumberCell: HTMLElement | null = null;
  selectedHeaderCell: HTMLElement | null = null;
  selectedCellsContainer: SelectionContainer;
  toolbarOptions: ToolbarOptions;
  isReadOnly: boolean;
  sheetName: string;
  singleSelectedCell: Coordinate | undefined;
  tableContainerDom: Element;
  private events: Events;

  constructor(
    lightSheetContainerDom: Element,
    lightSheetOptions: LightsheetOptions,
    events: Events | null = null,
  ) {
    this.selectedCell = [];
    this.selectedCellsContainer = {
      selectionStart: null,
      selectionEnd: null,
    };
    this.singleSelectedCell = undefined;
    this.events = events ?? new Events();
    this.registerEvents();
    this.toolbarOptions = {
      showToolbar: false,
      element: undefined,
      items: ToolbarItems,
      ...lightSheetOptions.toolbarOptions,
    };
    this.isReadOnly = lightSheetOptions.isReadOnly || false;
    this.sheetName = lightSheetOptions.sheetName;

    this.tableContainerDom = lightSheetContainerDom;
    lightSheetContainerDom.classList.add("lightsheet_table_container");

    //table
    this.createTableDom();

    //toolbar
    this.createToolbar();

    //formula bar
    this.createFormulaBar();
  }

  private createTableDom() {
    const tableDom = document.createElement("table");
    tableDom.classList.add("lightsheet_table");
    tableDom.setAttribute("cellpadding", "0");
    tableDom.setAttribute("cellspacing", "0");
    tableDom.setAttribute("unselectable", "yes");
    this.tableContainerDom.appendChild(tableDom);
    this.tableEl = tableDom;

    //thead
    this.tableHeadDom = document.createElement("thead");
    tableDom.appendChild(this.tableHeadDom);
    const tableHeadRowDom = document.createElement("tr");
    this.tableHeadDom.appendChild(tableHeadRowDom);
    const rowNumberCell = document.createElement("th");
    rowNumberCell.classList.add(
      "lightsheet_table_row_number",
      "lightsheet_table_td",
    );
    rowNumberCell.textContent = " ";
    tableHeadRowDom.appendChild(rowNumberCell);

    //tbody
    this.tableBodyDom = document.createElement("tbody");
    tableDom.appendChild(this.tableBodyDom);
  }

  private createToolbar() {
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
      this.tableEl.parentNode!.insertBefore(this.toolbarDom, this.tableEl);
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
    this.tableContainerDom.insertBefore(this.formulaBarDom, this.tableEl);
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
          const colIndex = this.singleSelectedCell.column;
          const rowIndex = this.singleSelectedCell.row;
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
        const colIndex = this.singleSelectedCell.column;
        const rowIndex = this.singleSelectedCell.row;
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

  addColumn() {
    const headerCellDom = document.createElement("th");
    headerCellDom.classList.add(
      "lightsheet_table_header",
      "lightsheet_table_td",
    );

    const newColumnNumber = this.getColumnCount() + 1;
    const newHeaderValue =
      LightsheetHelper.generateColumnLabel(newColumnNumber);

    headerCellDom.textContent = newHeaderValue;
    headerCellDom.onclick = (e: MouseEvent) =>
      this.onClickHeaderCell(e, newColumnNumber);

    const rowCount = this.getRowCount();
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      const rowDom = this.tableBodyDom.children[rowIndex];
      this.addCell(rowDom, newColumnNumber - 1, rowIndex, "");
    }

    this.tableHeadDom.children[0].appendChild(headerCellDom);
  }

  private onClickHeaderCell(e: MouseEvent, columnIndex: number) {
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
        childElement.children[columnIndex].classList.add(
          "lightsheet_table_selected_row_column",
        );
      });
    }
  }

  addRow(): HTMLElement {
    const rowCount = this.getRowCount();
    const rowDom = this.createRowElement(rowCount);
    this.tableBodyDom.appendChild(rowDom);

    const columnCount = this.getColumnCount();
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
      this.addCell(rowDom, columnIndex, rowCount, "");
    }
    return rowDom;
  }

  private createRowElement(labelCount: number): HTMLElement {
    const rowDom = document.createElement("tr");
    rowDom.id = this.getIndexedRowId(labelCount);
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

  getRow(rowKey: string): HTMLElement | null {
    return document.getElementById(rowKey);
  }

  addCell(
    rowDom: Element,
    colIndex: number,
    rowIndex: number,
    value: any,
    columnKey?: string,
  ): HTMLElement {
    const cellDom = document.createElement("td");
    cellDom.classList.add(
      "lightsheet_table_cell",
      "lightsheet_table_row_cell",
      "lightsheet_table_td",
    );
    rowDom.appendChild(cellDom);
    cellDom.id = this.getIndexedCellId(colIndex, rowIndex);
    cellDom.setAttribute("column-index", `${colIndex}` || "");
    cellDom.setAttribute("row-index", `${rowIndex}` || "");

    const inputDom = document.createElement("input");
    inputDom.classList.add("lightsheet_table_cell_input");
    inputDom.value = "";
    inputDom.readOnly = this.isReadOnly;
    cellDom.appendChild(inputDom);

    if (value) {
      cellDom.id = `${columnKey}_${rowDom.id}`;
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
        column: Number(colIndex),
        row: Number(rowIndex),
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

  onUICellValueChange(rawValue: string, colIndex: number, rowIndex: number) {
    const payload: UISetCellPayload = {
      indexPosition: { column: colIndex, row: rowIndex },
      rawValue,
    };
    this.events.emit(new LightsheetEvent(EventType.UI_SET_CELL, payload));
  }

  private registerEvents() {
    this.events.on(EventType.CORE_SET_CELL, (event) => {
      this.onCoreSetCell(event);
    });
  }

  private onCoreSetCell(event: LightsheetEvent) {
    const payload = event.payload as CoreSetCellPayload;
    // Create new columns if the column index is greater than the current column count.
    const newColumns = payload.indexPosition.column - this.getColumnCount() + 1;
    for (let i = 0; i < newColumns; i++) {
      this.addColumn();
    }

    const newRows = payload.indexPosition.row - this.getRowCount() + 1;
    for (let i = 0; i < newRows; i++) {
      this.addRow();
    }

    // Get HTML elements and (new) IDs for the payload's cell and row.
    const elInfo = this.getElementInfoForSetCell(payload);

    elInfo.cellDom!.id = elInfo.cellDomId;
    elInfo.rowDom!.id = elInfo.rowDomId;

    // Update input element with values from the core.
    const inputEl = elInfo.cellDom!.firstChild! as HTMLInputElement;
    inputEl.setAttribute("rawValue", payload.rawValue);
    inputEl.setAttribute("resolvedValue", payload.formattedValue);
    inputEl.value = payload.formattedValue;
  }

  private getElementInfoForSetCell = (payload: CoreSetCellPayload) => {
    const colKey = payload.keyPosition.columnKey?.toString();
    const rowKey = payload.keyPosition.rowKey?.toString();

    const columnIndex = payload.indexPosition.column;
    const rowIndex = payload.indexPosition.row;

    const cellDomKey =
      colKey && rowKey ? `${colKey!.toString()}_${rowKey!.toString()}` : null;

    // Get the cell by either column and row key or position.
    const cellDom =
      (cellDomKey && document.getElementById(cellDomKey)) ||
      document.getElementById(this.getIndexedCellId(columnIndex, rowIndex));

    const newCellDomId = payload.clearCell
      ? this.getIndexedCellId(columnIndex, rowIndex)
      : `${colKey}_${rowKey}`;

    const newRowDomId = payload.clearRow
      ? this.getIndexedRowId(rowIndex)
      : rowKey!;

    let rowDom: HTMLElement | null = null;
    if (rowKey) {
      rowDom = document.getElementById(rowKey);
    }
    if (!rowDom) {
      rowDom = document.getElementById(this.getIndexedRowId(rowIndex));
    }

    return {
      cellDom: cellDom,
      cellDomId: newCellDomId,
      rowDom: rowDom,
      rowDomId: newRowDomId,
    };
  };

  getColumnCount() {
    return this.tableHeadDom.children[0].children.length - 1;
  }

  getRowCount() {
    return this.tableBodyDom.children.length;
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
    const cells = Array.from(this.tableContainerDom.querySelectorAll("td"));
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
    const cells = Array.from(this.tableContainerDom.querySelectorAll("td"));
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

  private getIndexedRowId(rowIndex: number) {
    return `${this.sheetName}_row_${rowIndex}`;
  }

  private getIndexedCellId(colIndex: number, rowIndex: number) {
    return `${this.sheetName}_${colIndex}_${rowIndex}`;
  }
}
