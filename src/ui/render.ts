import LightSheet from "../main";

export default class UI {
  tableEl: Element;
  tableBodyDom: Element;
  rowCount: number;
  colCount: number;
  lightSheet: LightSheet;

  constructor(
    el: Element,
    lightSheet: LightSheet,
    rowCount: number,
    colCount: number,
  ) {
    this.tableEl = el;
    this.colCount = colCount;
    this.rowCount = rowCount;
    this.lightSheet = lightSheet;

    const tableContainerDom = document.createElement("table");
    this.tableEl.appendChild(tableContainerDom);
    this.tableBodyDom = document.createElement("tbody");
    tableContainerDom.appendChild(this.tableBodyDom);
  }

  addRow(): Element {
    const rowDom = document.createElement("tr");
    this.tableBodyDom.appendChild(rowDom);
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

      // The row or column may be deleted if the cell is cleared.
      if (!position.rowKey) {
        rowDom.id = `row-${rowIndex}`;
      }
      if (!position.columnKey) {
        cellDom.id = `${colIndex}-${rowIndex}`;
      }
    }

    //fire cell onchange event to client callback
    this.lightSheet.onCellChange?.(colIndex, rowIndex, newValue);
  }
}
