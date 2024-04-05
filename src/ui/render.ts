import { ToolbarItems } from "../../utils/constants";
import LightSheet from "../main";
import {
  generateColumnKey,
  generateRowKey,
} from "../core/structure/key/keyTypes";
import { CellIdInfo } from "./render.types.ts";
import LightsheetEvent from "../core/event/event.ts";
import { CoreSetCellPayload } from "../core/event/events.types.ts";
import EventType from "../core/event/eventType.ts";
import { ToolbarOptions } from "../main.types";

export default class UI {
  tableEl: Element;
  lightSheetToolBarDom: HTMLElement;
  lightSheetFormulaBarDom: HTMLElement;
  lightSheetFormulaInput: HTMLInputElement;
  tableHeadDom: Element;
  tableBodyDom: Element;
  rowCount: number;
  colCount: number;
  lightSheet: LightSheet;
  selectedCell: number[] | undefined;
  toolbarOptions?: ToolbarOptions;

  constructor(
    el: Element,
    lightSheet: LightSheet,
    rowCount: number,
    colCount: number,
    toolbarOptions?: ToolbarOptions,
  ) {
    this.tableEl = el;
    this.colCount = colCount;
    this.rowCount = rowCount;
    this.lightSheet = lightSheet;
    this.selectedCell = [];
    this.registerEvents();
    this.toolbarOptions = {
      showToolbar: true,
      element: undefined,
      items: ToolbarItems,
      ...toolbarOptions,
    };

    this.tableEl.classList.add("lightsheet_table_container");

    /*toolbar*/
    this.lightSheetToolBarDom = document.createElement("div");
    this.lightSheetToolBarDom.classList.add("light_sheet_table_toolbar");
    this.lightSheetToolBarDom.style.display = "none";

    if (this.toolbarOptions) {
      this.createToolBar();
      if (this.toolbarOptions.showToolbar) {
        this.showToolBar(this.toolbarOptions.showToolbar);
      }
    }

    /*content*/
    const lightSheetContainerDom = document.createElement("div");
    lightSheetContainerDom.classList.add("lightsheet_table_content");
    this.tableEl.appendChild(lightSheetContainerDom);

    /*formula bar*/
    this.lightSheetFormulaBarDom = document.createElement("div");
    this.lightSheetFormulaBarDom.classList.add("light_sheet_table_formula_bar");
    lightSheetContainerDom.appendChild(this.lightSheetFormulaBarDom);
    this.lightSheetFormulaInput = document.createElement("input");
    this.lightSheetFormulaBarDom.appendChild(this.lightSheetFormulaInput);
    this.setFormulaBar();

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

  createToolBar() {
    if (this.toolbarOptions) {
      if (this.toolbarOptions.element != null) {
        this.toolbarOptions.element.appendChild(this.lightSheetToolBarDom);
      } else {
        //insert the tool bar as first child
        this.tableEl.insertBefore(
          this.lightSheetToolBarDom,
          this.tableEl.firstChild,
        );
      }

      const toolbarContent = this.toolbarOptions.items;

      for (let i = 0; i < toolbarContent.length; i++) {
        const toolbarItem = document.createElement("i");
        toolbarItem.classList.add("lightSheet_toolbar_item");
        toolbarItem.classList.add("material-symbols-outlined");
        toolbarItem.textContent = toolbarContent[i];
        this.lightSheetToolBarDom.appendChild(toolbarItem);
      }
    }
  }

  showToolBar(isShown: boolean) {
    if (isShown) {
      this.lightSheetToolBarDom.style.display = "flex";
    } else {
      this.lightSheetToolBarDom.style.display = "none";
    }
  }

  setFormulaBar() {
    let focusedCell: HTMLElement | null = null;

    this.tableEl.addEventListener("focusin", (event) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains("lightsheet_table_cell_input")) {
        focusedCell = target.parentElement as HTMLElement;
      }
    });

    // Listen for input changes in the formula bar
    this.lightSheetFormulaInput.addEventListener("input", () => {
      if (focusedCell) {
        const newValue = this.lightSheetFormulaInput.value;
        const [colIndex, rowIndex] = focusedCell.id.split("_");
        //for debug value
        console.log(newValue);
        console.log(colIndex);
        console.log(rowIndex);
        this.onUICellValueChange(
          newValue,
          parseInt(colIndex),
          parseInt(rowIndex),
        );
      } else {
        console.error("No cell is currently in focus.");
      }
    });
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

  addRow(rowLabelNumber: number): HTMLElement {
    const rowDom = document.createElement("tr");
    this.tableBodyDom.appendChild(rowDom);

    //row number
    const rowNumberCell = document.createElement("td");
    rowNumberCell.innerHTML = `${rowLabelNumber + 1}`; // Row numbers start from 1
    rowNumberCell.classList.add(
      "lightsheet_table_row_number",
      "lightsheet_table_row_cell",
      "lightsheet_table_td",
    );
    rowDom.appendChild(rowNumberCell); // Append the row number cell to the row

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

    inputDom.addEventListener("input", (e: Event) => {
      const newValue = (e.target as HTMLInputElement).value;
      this.lightSheetFormulaInput.value = newValue;
      this.onUICellValueChange(newValue, colIndex, rowIndex);
    });

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

      //connect with formula bar
      this.lightSheetFormulaInput.value = inputDom.value;
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

    this.lightSheet.events.emit(
      new LightsheetEvent(EventType.UI_SET_CELL, payload),
    );
  }

  private registerEvents() {
    this.lightSheet.events.on(EventType.CORE_SET_CELL, (event) =>
      this.onCoreSetCell(event),
    );
  }

  private onCoreSetCell(event: LightsheetEvent) {
    const payload = event.payload as CoreSetCellPayload;
    // Get HTML elements and (new) IDs for the payload's cell and row.
    const elInfo = UI.getElementInfoForSetCell(payload);

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

  private static getElementInfoForSetCell(payload: CoreSetCellPayload) {
    const colKey = payload.position.columnKey?.toString();
    const rowKey = payload.position.rowKey?.toString();

    const columnIndex = payload.indexPosition.columnIndex;
    const rowIndex = payload.indexPosition.rowIndex;

    const cellDomKey =
      colKey && rowKey ? `${colKey!.toString()}_${rowKey!.toString()}` : null;

    // Get the cell by either column and row key or position.
    // TODO Index-based ID may not be unique if there are multiple sheets.
    const cellDom =
      (cellDomKey && document.getElementById(cellDomKey)) ||
      document.getElementById(`${columnIndex}_${rowIndex}`);

    const newCellDomId = payload.clearCell
      ? `${columnIndex}_${rowIndex}`
      : `${colKey}_${rowKey}`;

    const newRowDomId = payload.clearRow ? `row_${rowIndex}` : rowKey!;

    const rowDom =
      (rowKey && document.getElementById(rowKey)) ||
      document.getElementById(`row_${rowIndex}`);

    return {
      cellDom: cellDom,
      cellDomId: newCellDomId,
      rowDom: rowDom,
      rowDomId: newRowDomId,
    };
  }

  private checkCellId(cellDom: Element): CellIdInfo | undefined {
    const keyParts = cellDom.id.split("_");
    if (keyParts.length != 2) return;

    const isIndex = keyParts[0].match("^[0-9]+$") !== null;

    return { keyParts: keyParts, isIndex: isIndex };
  }
}
