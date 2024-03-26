import { ToolbarItems } from "../../utils/constants";
import LightSheet from "../main";
import { ToolbarOptions } from "../main.types";

export default class UI {
  tableEl: Element;
  lightSheetToolBarDom: HTMLElement;
  tableHeadDom: Element;
  tableBodyDom: Element;
  rowCount: number;
  colCount: number;
  lightSheet: LightSheet;
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
    this.toolbarOptions = {
      showToolbar: true,
      element: undefined,
      items: ToolbarItems,
      ...toolbarOptions,
    };

    this.tableEl.classList.add("light_sheet_table_container");

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
    lightSheetContainerDom.classList.add("light_sheet_table_content");
    this.tableEl.appendChild(lightSheetContainerDom);

    const tableContainerDom = document.createElement("table");
    tableContainerDom.classList.add("light_sheet_table");
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

  addHeader(headerData: string[]) {
    const headerRowDom = document.createElement("tr");
    this.tableHeadDom.appendChild(headerRowDom);

    for (let i = 0; i < headerData.length; i++) {
      const headerCellDom = document.createElement("td");
      headerCellDom.textContent = headerData[i];
      headerRowDom.appendChild(headerCellDom);
    }
  }

  addRow(rowLabelNumber: number): Element {
    const rowDom = document.createElement("tr");
    this.tableBodyDom.appendChild(rowDom);

    //row number
    const rowNumberCell = document.createElement("td");
    rowNumberCell.innerHTML = `${rowLabelNumber + 1}`; // Row numbers start from 1
    rowNumberCell.className = "light_sheet_table_row"; // Add class for styling
    rowDom.appendChild(rowNumberCell); // Append the row number cell to the row

    return rowDom;
  }

  addColumn(
    rowDom: Element,
    colIndex: number,
    rowIndex: number,
    value: any,
    columnKey?: string,
  ) {
    const cellDom = document.createElement("td");
    rowDom.appendChild(cellDom);
    cellDom.id = `${colIndex}-${rowIndex}`;
    const inputDom = document.createElement("input");
    inputDom.value = "";

    cellDom.appendChild(inputDom);

    if (value) {
      cellDom.id = columnKey!;
      inputDom.value = value;
    }

    inputDom.onchange = (e: Event) =>
      this.onCellValueChange(
        (e.target as HTMLInputElement).value,
        rowDom,
        cellDom,
        colIndex,
        rowIndex,
      );
  }

  setCellValue(value: string, rowKey: string, colKey: string) {
    const rowDom = document.getElementById(rowKey);
    if (!rowDom) return;
    // TODO This method is working around duplicate IDs. (issue #47)
    // TODO Cell formula should be preserved. (Issue #49)
    for (let i = 0; i < rowDom.children.length; i++) {
      const cellDom = rowDom.children.item(i)!;
      if (cellDom.id == colKey) {
        const inputDom = cellDom.childNodes.item(0);
        (inputDom as HTMLInputElement).value = value;
      }
    }
  }

  onCellValueChange(
    newValue: string,
    rowDom: Element,
    cellDom: Element,
    colIndex: number,
    rowIndex: number,
  ) {
    const keyParts = cellDom.id.split("-");

    //if it was enpty value previously then the keyparts lenth will be 2, hence we create a cell in core and update ui with new keys
    if (keyParts.length == 2) {
      const cell = this.lightSheet.setCellAt(
        parseInt(keyParts[0]),
        parseInt(keyParts[1]),
        newValue,
      );
      // Keys will be valid as value shouldn't be empty at this point.
      rowDom.id = cell.rowKey!.toString();
      cellDom.id = cell.columnKey!.toString();
    } else {
      const position = this.lightSheet.setCell(cellDom.id, rowDom.id, newValue);

      // The row may be deleted if the cell is cleared.
      if (!position.rowKey) {
        rowDom.id = `row-${rowIndex}`;
      }
      // Empty cells should not hold a column key.
      if (newValue == "") {
        cellDom.id = `${colIndex}-${rowIndex}`;
      }
    }

    //fire cell onchange event to client callback
    this.lightSheet.onCellChange?.(colIndex, rowIndex, newValue);
  }
}
