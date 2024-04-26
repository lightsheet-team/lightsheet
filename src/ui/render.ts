import LightSheet from "../main";
import { SelectionContainer } from "./render.types.ts";
import LightsheetEvent from "../core/event/event.ts";
import {
  CoreSetCellPayload,
  UISetCellPayload,
} from "../core/event/events.types.ts";
import EventType from "../core/event/eventType.ts";
import { ToolbarOptions } from "../main.types";
import LightSheetHelper from "../utils/helpers.ts";
import { ToolbarItems } from "../utils/constants.ts";

export default class UI {
  tableEl: Element;
  toolbarDom: HTMLElement | undefined;
  tableHeadDom: Element;
  tableBodyDom: Element;
  lightSheet: LightSheet;
  selectedCell: number[];
  selectedRowNumberCell: HTMLElement | null = null;
  selectedHeaderCell: HTMLElement | null = null;
  selectedCellsContainer: SelectionContainer;
  toolbarOptions: ToolbarOptions;
  isReadOnly: boolean;

  constructor(
    lightSheetContainerDom: Element,
    lightSheet: LightSheet,
    toolbarOptions?: ToolbarOptions,
  ) {
    this.lightSheet = lightSheet;
    this.selectedCell = [];
    this.selectedCellsContainer = {
      selectionStart: null,
      selectionEnd: null,
    };
    this.registerEvents();
    this.toolbarOptions = {
      showToolbar: false,
      element: undefined,
      items: ToolbarItems,
      ...toolbarOptions,
    };
    this.isReadOnly = lightSheet.options.isReadOnly || false;

    lightSheetContainerDom.classList.add("lightsheet_table_container");

    /*content*/
    const tableDom = document.createElement("table");
    tableDom.classList.add("lightsheet_table");
    tableDom.setAttribute("cellpadding", "0");
    tableDom.setAttribute("cellspacing", "0");
    tableDom.setAttribute("unselectable", "yes");
    lightSheetContainerDom.appendChild(tableDom);
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

    //toolbar
    this.createToolbar();
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

  addColumn() {
    const headerCellDom = document.createElement("th");
    headerCellDom.classList.add(
      "lightsheet_table_header",
      "lightsheet_table_td",
    );

    const newColumnNumber = this.getColumnCount() + 1;
    const newHeaderValue =
      LightSheetHelper.GenerateColumnLabel(newColumnNumber);

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

  private onClickHeaderCell(e: MouseEvent, indexOfTheHeader: number) {
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
        childElement.children[indexOfTheHeader].classList.add(
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
    rowDom.id = `row_${labelCount}`;
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

  private addCell(
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
    cellDom.id = `${colIndex}_${rowIndex}`;
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

    inputDom.onchange = (e: Event) =>
      this.onUICellValueChange(
        (e.target as HTMLInputElement).value,
        colIndex,
        rowIndex,
      );

    inputDom.onfocus = () => {
      this.removeGroupSelection();
      this.removeCellRangeSelection();
      cellDom.classList.add("lightsheet_table_selected_cell");
      if (colIndex !== undefined && rowIndex !== undefined) {
        this.selectedCell.push(colIndex, rowIndex);
      }
    };

    inputDom.onblur = () => {
      this.selectedCell = [];
      cellDom.classList.remove("lightsheet_table_selected_cell");
    };

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
  }

  onUICellValueChange(newValue: string, colIndex: number, rowIndex: number) {
    const payload: UISetCellPayload = {
      indexPosition: { column: colIndex, row: rowIndex },
      rawValue: newValue,
    };
    this.lightSheet.events.emit(
      new LightsheetEvent(EventType.UI_SET_CELL, payload),
    );
  }

  private registerEvents() {
    this.lightSheet.events.on(EventType.CORE_SET_CELL, (event) => {
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

    // Set cell value to resolved value from the core.
    // TODO Cell formula should be preserved. (Issue #49)
    (elInfo.cellDom!.firstChild! as HTMLInputElement).value =
      payload.formattedValue;
  }

  private getElementInfoForSetCell = (payload: CoreSetCellPayload) => {
    const colKey = payload.keyPosition.columnKey?.toString();
    const rowKey = payload.keyPosition.rowKey?.toString();

    const columnIndex = payload.indexPosition.column;
    const rowIndex = payload.indexPosition.row;

    const cellDomKey =
      colKey && rowKey ? `${colKey!.toString()}_${rowKey!.toString()}` : null;

    // Get the cell by either column and row key or position.
    // TODO Index-based ID may not be unique if there are multiple sheets.
    const cellDom = cellDomKey
      ? document.getElementById(cellDomKey)
      : document.getElementById(`${columnIndex}_${rowIndex}`);

    const newCellDomId = payload.clearCell
      ? `${columnIndex}_${rowIndex}`
      : `${colKey}_${rowKey}`;

    const newRowDomId = payload.clearRow ? `row_${rowIndex}` : rowKey!;

    const rowDom: HTMLElement | null = rowKey
      ? document.getElementById(rowKey)
      : document.getElementById(`row_${rowIndex}`);

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
