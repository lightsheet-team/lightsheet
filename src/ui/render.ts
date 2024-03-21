import LightSheet from "../main";

export default class UI {
  tableEl: Element;
  tableHeadDom: Element;
  tableBodyDom: Element;
  rowCount: number;
  lightSheet: LightSheet;

  constructor(
    el: Element,
    lightSheet: LightSheet,
    rowCount: number,
  ) {
    this.tableEl = el;
    this.rowCount = rowCount;
    this.lightSheet = lightSheet;

    this.tableEl.classList.add("light_sheet_table_container");

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
    cellDom.id = `${colIndex}_${rowIndex}`;
    const inputDom = document.createElement("input");
    inputDom.value = "";

    cellDom.appendChild(inputDom);

    if (value) {
      cellDom.id = `${columnKey}_${rowDom.id}`;
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

  onCellValueChange(
    newValue: string,
    rowDom: Element,
    cellDom: Element,
    colIndex: number,
    rowIndex: number,
  ) {
    const keyParts = cellDom.id.split("_");
    if (keyParts.length != 2) return;

    let cell;
    // If the key parts are integers, we need to create a cell in core and update ui with new keys.
    if (keyParts[0].match("^[0-9]+$")) {
      cell = this.lightSheet.setCellAt(colIndex, rowIndex, newValue);
      // Keys will be valid as value shouldn't be empty at this point.
      rowDom.id = cell.position.rowKey!.toString();
      cellDom.id = `${cell.position.columnKey!.toString()}_${cell.position.rowKey!.toString()}`;
    } else {
      cell = this.lightSheet.setCell(keyParts[0], keyParts[1], newValue);
      // The row may be deleted if the cell is cleared.
      if (!cell.position.rowKey) {
        rowDom.id = `row_${rowIndex}`;
      }
      // Empty cells should not hold a column key.
      if (newValue == "") {
        cellDom.id = `${colIndex}_${rowIndex}`;
      }
    }
    // Set cell value to resolved value from the core.
    // TODO Cell formula should be preserved. (Issue #49)
    (cellDom.firstChild! as HTMLInputElement).value = cell.value!;

    //fire cell onchange event to client callback
    this.lightSheet.onCellChange?.(colIndex, rowIndex, newValue);
  }
}
