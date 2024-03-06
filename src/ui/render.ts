import LightSheet from "../main";
import {
  generateColumnKey,
  generateRowKey,
} from "../core/structure/key/keyTypes";

export default class UI {
  tableEl: Element;
  tableBodyDom: Element;
  rowCount: number;
  colCount: number;
  lightSheet: LightSheet;
  selectedCell: String;

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
    this.selectedCell = "";

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
    inputDom.style.outline = "none";
    inputDom.style.backgroundColor = "transparent";

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

    inputDom.onfocus = (e: Event) => {
      // this.selectedCell =
      // console.log(cellDom);
      cellDom.style.backgroundColor = "yellow";
      let x = cellDom.id.split("-");

      console.log(x);
      console.log(this.lightSheet.sheet.getRowIndex(generateRowKey(x[0])));
      // console.log(
      //   this.lightSheet.sheet.getColumnIndex(
      //     generateColumnKey(cellDom.id.split("-")[1])
      //   )
      // );
    };

    inputDom.onblur = (e: Event) => {
      this.selectedCell = "";
      cellDom.style.backgroundColor = "white";
    };

    cellDom.onclick = (e: Event) => {
      // console.log("cell clicked");
      // console.log(cellDom.id);
      // cellDom.style.backgroundColor = "yellow";
      // this.lightSheet.onCellClick?.(colIndex, rowIndex);
    };

    // cellDom.onfocus = (e: Event) => {
    //   this.selectedCell = cellDom.id;
    //   cellDom.style.backgroundColor = "yellow";
    // };

    // cellDom.onblur = (e: Event) => {
    //   this.selectedCell = "";
    //   cellDom.style.backgroundColor = "white";
    // };
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
        newValue
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
