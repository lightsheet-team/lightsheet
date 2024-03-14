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
  selectedCell: Number[] | undefined;

  constructor(
    el: Element,
    lightSheet: LightSheet,
    rowCount: number,
    colCount: number
  ) {
    this.tableEl = el;
    this.colCount = colCount;
    this.rowCount = rowCount;
    this.lightSheet = lightSheet;
    this.selectedCell = [];

    const tableContainerDom = document.createElement("table");
    tableContainerDom.style.borderCollapse = "collapse";
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
    columnKey?: string
  ) {
    const cellDom = document.createElement("td");
    rowDom.appendChild(cellDom);
    cellDom.id = `${colIndex}-${rowIndex}`;
    const inputDom = document.createElement("input");
    inputDom.value = "";

    inputDom.style.outline = "none";
    inputDom.style.backgroundColor = "transparent";
    inputDom.style.borderStyle = "none";
    cellDom.style.border = "2px solid #000";

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
        rowIndex
      );

    inputDom.onfocus = (e: Event) => {
      cellDom.style.borderStyle = "solid";
      cellDom.style.margin = "0px";
      cellDom.style.border = "2px solid blue";

      let columnIndex: number | undefined;
      let rowIndex: number | undefined;

      if (!this.isUUIDv4(cellDom.id)) {
        let x = cellDom.id.split("-");
        columnIndex = Number(x[0]);
        rowIndex = Number(x[1]);
      } else {
        let columnKey = cellDom.id;
        let rowKey = cellDom.parentElement?.id;

        columnIndex = this.lightSheet.sheet.getColumnIndex(
          generateColumnKey(columnKey!)
        );
        rowIndex = this.lightSheet.sheet.getRowIndex(generateRowKey(rowKey!));
      }
      this.selectedCell?.push(Number(columnIndex), Number(rowIndex));
    };

    inputDom.onblur = (e: Event) => {
      this.selectedCell = [];
      cellDom.style.border = "2px solid #000";
    };
  }

  onCellValueChange(
    newValue: string,
    rowDom: Element,
    cellDom: Element,
    colIndex: number,
    rowIndex: number
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

  isUUIDv4(str: string) {
    const uuidv4Pattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidv4Pattern.test(str);
  }
}
