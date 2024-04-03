import LightSheet from "../main";
import {
  generateColumnKey,
  generateRowKey,
} from "../core/structure/key/keyTypes";
import { CellIdInfo, SelectionContainer } from "./render.types.ts";
import LightsheetEvent from "../core/event/event.ts";
import { CoreSetCellPayload } from "../core/event/events.types.ts";
import EventType from "../core/event/eventType.ts";
import LightSheetHelper from "../../utils/helpers.ts";

export default class UI {
  tableEl: Element;
  tableHeadDom: Element;
  tableBodyDom: Element;
  rowCount: number;
  lightSheet: LightSheet;
  selectedCell: number[];
  selectedCellsContainer: SelectionContainer;

  constructor(el: Element, lightSheet: LightSheet, rowCount: number) {
    this.tableEl = el;
    this.rowCount = rowCount;
    this.lightSheet = lightSheet;
    this.selectedCell = [];
    this.selectedCellsContainer = {
      selectionStart: null,
      selectionEnd: null,
    };
    this.registerEvents();

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

  addColumn(
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
      cellDom.classList.add("lightsheet_table_selected_cell");

      let columnIndex: number | undefined;
      let rowIndex: number | undefined;

      const cellIdInfo = this.checkCellId(cellDom);
      if (!cellIdInfo) return;
      const { keyParts, isIndex } = cellIdInfo;

      if (isIndex) {
        columnIndex = Number(keyParts[0]);
        rowIndex = Number(keyParts[1]);
      } else {
        const columnKey = cellDom.id;
        const rowKey = cellDom.parentElement?.id;

        columnIndex = this.lightSheet.sheet.getColumnIndex(
          generateColumnKey(columnKey!),
        );
        rowIndex = this.lightSheet.sheet.getRowIndex(generateRowKey(rowKey!));
      }
      this.selectedCell?.push(Number(columnIndex), Number(rowIndex));
    };

    inputDom.onblur = () => {
      this.selectedCell = [];
      cellDom.classList.remove("lightsheet_table_selected_cell");
    };

    return cellDom;
  }

  onUICellValueChange(newValue: string, colIndex: number, rowIndex: number) {
    const payload = {
      indexPosition: { columnIndex: colIndex, rowIndex: rowIndex },
      formula: newValue,
    };
    console.log(this.lightSheet.isReady);
    this.lightSheet.events.emit(
      new LightsheetEvent(EventType.UI_SET_CELL, payload),
    );
  }

  private registerEvents() {
    this.lightSheet.events.on(EventType.CORE_SET_CELL, (event) => {
      if (this.lightSheet.isReady)
        this.onCoreSetCell(event)
    }
    );
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
      elInfo.cellDom = this.addColumn(
        elInfo.rowDom!,
        payload.indexPosition.columnIndex,
        payload.indexPosition.rowIndex,
        payload.value,
        payload.position.columnKey?.toString(),
      );
    }

    elInfo.cellDom.id = elInfo.cellDomId;
    elInfo.rowDom.id = elInfo.rowDomId;

    // Set cell value to resolved value from the core.
    // TODO Cell formula should be preserved. (Issue #49)
    (elInfo.cellDom.firstChild! as HTMLInputElement).value = payload.value;
  }


  private checkCellId(cellDom: Element): CellIdInfo | undefined {
    const keyParts = cellDom.id.split("_");
    if (keyParts.length != 2) return;

    const isIndex = keyParts[0].match("^[0-9]+$") !== null;

    return { keyParts: keyParts, isIndex: isIndex };
  }
}
