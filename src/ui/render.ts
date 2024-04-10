import LightSheet from "../main";
import {
  generateColumnKey,
  generateRowKey,
} from "../core/structure/key/keyTypes";
import { CellIdInfo, SelectionContainer } from "./render.types.ts";
import LightsheetEvent from "../core/event/event.ts";
import {
  CoreSetCellPayload,
  UISetCellPayload,
} from "../core/event/events.types.ts";
import EventType from "../core/event/eventType.ts";
import LightSheetHelper from "../../utils/helpers.ts";

export default class UI {
  tableEl: Element;
  tableHeadDom: Element;
  tableBodyDom: Element;
  lightSheet: LightSheet;
  selectedCell: number[];
  selectedRowNumberCell: HTMLElement | null = null;
  selectedHeaderCell: HTMLElement | null = null;
  selectedCellsContainer: SelectionContainer;
  isReadOnly: boolean;

  constructor(el: Element, lightSheet: LightSheet) {
    this.tableEl = el;
    this.lightSheet = lightSheet;
    this.selectedCell = [];
    this.selectedCellsContainer = {
      selectionStart: null,
      selectionEnd: null,
    };
    this.registerEvents();
    this.isReadOnly = lightSheet.options.isReadOnly || false;

    this.tableEl.classList.add("lightsheet_table_container");

    const lightSheetContainerDom = document.createElement("div");
    lightSheetContainerDom.classList.add("lightsheet_table_content");
    this.tableEl.appendChild(lightSheetContainerDom);

    const tableContainerDom = document.createElement("table");
    tableContainerDom.classList.add("lightsheet_table");
    tableContainerDom.setAttribute("cellpadding", "0");
    tableContainerDom.setAttribute("cellspacing", "0");
    tableContainerDom.setAttribute("unselectable", "yes");
    lightSheetContainerDom.appendChild(tableContainerDom);

    //thead
    this.tableHeadDom = document.createElement("thead");
    tableContainerDom.appendChild(this.tableHeadDom);

    //tbody
    this.tableBodyDom = document.createElement("tbody");
    tableContainerDom.appendChild(this.tableBodyDom);
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

  addRow(rowLabelNumber: number): HTMLElement {
    const rowDom = this.createRowElement(rowLabelNumber);
    this.tableBodyDom.appendChild(rowDom);
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
    cellDom.id = `${colIndex}_${rowIndex}`;
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
      const { columnIndex, rowIndex } = this.getColumnAndRowIndex(cellDom);
      if (columnIndex !== undefined && rowIndex !== undefined) {
        this.selectedCell.push(columnIndex, rowIndex);
      }
    };

    inputDom.onblur = () => {
      this.selectedCell = [];
      cellDom.classList.remove("lightsheet_table_selected_cell");
    };

    inputDom.onmousedown = (e: MouseEvent) => {
      this.handleMouseDown(e, cellDom);
    };

    inputDom.onmouseup = (e: MouseEvent) => {
      this.handleMouseUp(e, cellDom);
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
      indexPosition: { columnIndex: colIndex, rowIndex: rowIndex },
      rawValue: newValue,
    };
    this.lightSheet.events.emit(
      new LightsheetEvent(EventType.UI_SET_CELL, payload),
    );
  }

  private registerEvents() {
    this.lightSheet.events.on(EventType.CORE_SET_CELL, (event) => {
      if (this.lightSheet.isReady) this.onCoreSetCell(event);
    });
  }

  private onCoreSetCell(event: LightsheetEvent) {
    const payload = event.payload as CoreSetCellPayload;
    // Get HTML elements and (new) IDs for the payload's cell and row.
    const elInfo = LightSheetHelper.getElementInfoForSetCell(payload);

    if (!elInfo.rowDom) {
      const row = this.addRow(payload.indexPosition.rowIndex);
      elInfo.rowDom = row;
      row.id = elInfo.rowDomId;
    }
    if (!elInfo.cellDom) {
      elInfo.cellDom = this.addCell(
        elInfo.rowDom!,
        payload.indexPosition.columnIndex,
        payload.indexPosition.rowIndex,
        payload.formattedValue,
        payload.position.columnKey?.toString(),
      );
    }

    elInfo.cellDom.id = elInfo.cellDomId;
    elInfo.rowDom.id = elInfo.rowDomId;

    // Set cell value to resolved value from the core.
    // TODO Cell formula should be preserved. (Issue #49)
    (elInfo.cellDom.firstChild! as HTMLInputElement).value =
      payload.formattedValue;
  }

  private checkCellId(cellDom: Element): CellIdInfo | undefined {
    const keyParts = cellDom.id.split("_");
    if (keyParts.length != 2) return;

    const isIndex = keyParts[0].match("^[0-9]+$") !== null;

    return { keyParts: keyParts, isIndex: isIndex };
  }

  private getColumnAndRowIndex(cellDom: Element): {
    columnIndex?: number;
    rowIndex?: number;
  } {
    let columnIndex: number | undefined;
    let rowIndex: number | undefined;

    const cellIdInfo = this.checkCellId(cellDom);
    if (!cellIdInfo) return {};
    const { keyParts, isIndex } = cellIdInfo;
    if (isIndex) {
      columnIndex = Number(keyParts[0]);
      rowIndex = Number(keyParts[1]);
    } else {
      const columnKey = cellDom.id.split("_")[0];
      const rowKey = cellDom.parentElement?.id;

      columnIndex = this.lightSheet.sheet.getColumnIndex(
        generateColumnKey(columnKey!),
      );
      rowIndex = this.lightSheet.sheet.getRowIndex(generateRowKey(rowKey!));
    }

    return { columnIndex, rowIndex };
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

    const { columnIndex: cellColumnIndex, rowIndex: cellRowIndex } =
      this.getColumnAndRowIndex(cell);

    if (cellColumnIndex === undefined || cellRowIndex === undefined)
      return false;

    const withinX =
      (cellColumnIndex >= selectionStart.columnPosition &&
        cellColumnIndex <= selectionEnd.columnPosition) ||
      (cellColumnIndex <= selectionStart.columnPosition &&
        cellColumnIndex >= selectionEnd.columnPosition);
    const withinY =
      (cellRowIndex >= selectionStart.rowPosition &&
        cellRowIndex <= selectionEnd.rowPosition) ||
      (cellRowIndex <= selectionStart.rowPosition &&
        cellRowIndex >= selectionEnd.rowPosition);

    return withinX && withinY;
  }

  updateSelection() {
    this.removeCellRangeSelection();
    const cells = Array.from(document.querySelectorAll("td"));
    cells.forEach((cell) => {
      if (
        this.cellInRange(cell) &&
        !cell.classList.contains("lightsheet_table_selected_cell")
      ) {
        cell.classList.add("lightsheet_table_selected_cell_range");
      }
    });
  }

  handleMouseDown(e: MouseEvent, cellDom: Element) {
    if (e.button === 0) {
      const { columnIndex: cellColumnIndex, rowIndex: cellRowIndex } =
        this.getColumnAndRowIndex(cellDom);
      this.selectedCellsContainer.selectionStart =
        (cellColumnIndex != null || undefined) &&
        (cellRowIndex != null || undefined)
          ? {
              rowPosition: Number(cellRowIndex),
              columnPosition: Number(cellColumnIndex),
            }
          : null;
    }
  }

  handleMouseUp(e: MouseEvent, cellDom: Element) {
    if (e.button === 0) {
      const { columnIndex: cellColumnIndex, rowIndex: cellRowIndex } =
        this.getColumnAndRowIndex(cellDom);
      this.selectedCellsContainer.selectionEnd =
        (cellColumnIndex != null || undefined) &&
        (cellRowIndex != null || undefined)
          ? {
              rowPosition: Number(cellRowIndex),
              columnPosition: Number(cellColumnIndex),
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
}
