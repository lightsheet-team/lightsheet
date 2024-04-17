import { ToolbarItems } from "../../utils/constants";
import LightSheet from "../main";
import {
  generateColumnKey,
  generateRowKey,
} from "../core/structure/key/keyTypes";
import { CellIdInfo, SelectionContainer } from "./render.types.ts";
import LightsheetEvent from "../core/event/event.ts";
import {
  CoreSetCellPayload,
  CoreSetStylePayload,
  UISetCellPayload,
} from "../core/event/events.types.ts";
import EventType from "../core/event/eventType.ts";
import LightSheetHelper from "../../utils/helpers.ts";
import { ToolbarOptions } from "../main.types";
import CellStyle from "../core/structure/cellStyle.ts";

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

    /*content*/
    const lightSheetContainerDom = document.createElement("div");
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
    this.lightSheet.events.on(EventType.VIEW_SET_STYLE, (event) => {
      this.onCoreSetStyle(event.payload);
    });
  }

  private onCoreSetStyle(event: CoreSetStylePayload) {
    const { position, value } = event;
    const cellDomKey =
      `${position.columnKey!.toString()}_${position.rowKey!.toString()}`;
    // Get the cell by either column and row key or position.
    // TODO Index-based ID may not be unique if there are multiple sheets.
    const cellDom: HTMLElement = document.getElementById(cellDomKey)!;
    const inputElement = cellDom.children[0] as HTMLInputElement
    inputElement.setAttribute("style", value);
  }

  private onCoreSetCell(event: LightsheetEvent) {
    const payload = event.payload as CoreSetCellPayload;
    // Get HTML elements and (new) IDs for the payload's cell and row.
    const elInfo = LightSheetHelper.GetElementInfoForSetCell(payload);

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
}
