import LightSheet from "../main";

export default class UI {
  tableEl: any;
  tableBodyDom: any
  rowCount: number;
  colCount: number;
  core: LightSheet;

  constructor(el: Element | HTMLDocument, core: LightSheet, rowCount: number, colCount: number) {
    this.tableEl = el;
    this.colCount = colCount;
    this.rowCount = rowCount;
    this.core = core;
    this.initializeTableContainer();
  }

  initializeTableContainer() {
    const tableContainerDom = document.createElement('table');
    this.tableEl.appendChild(tableContainerDom)
    this.tableBodyDom = document.createElement('tbody');
    tableContainerDom.appendChild(this.tableBodyDom);
  }

  addRow(): Element {
    const rowDom = document.createElement('tr');
    this.tableBodyDom.appendChild(rowDom);
    return rowDom;
  }

  addColumn(rowDom: Element, colIndex: number, rowIndex: number, value: any, columnKey?: string) {
    const cellDom = document.createElement('td')
    rowDom.appendChild(cellDom);
    cellDom.id = `${colIndex}-${rowIndex}`
    const inputDom = document.createElement('input')
    inputDom.value = ''

    cellDom.appendChild(inputDom);

    if (value) {
      cellDom.id = columnKey!!
      inputDom.value = value
    }

    inputDom.onchange = (e: Event) => this.onCellValueChange((e.target as HTMLInputElement).value, rowDom, cellDom, colIndex, rowIndex)
  }

  onCellValueChange(newValue: string, rowDom: Element, cellDom: Element, colIndex: number, rowIndex: number) {
    const keyParts = cellDom.id.split('-');

    //if it was enpty value previously then the keyparts lenth will be 2, hence we create a cell in core and update ui with new keys
    if (keyParts.length == 2) {
      const cell = this.core.setCellAt(parseInt(keyParts[0]), parseInt(keyParts[1]), newValue)
      rowDom.id = cell.rowKey.toString()
      cellDom.id = cell.columnKey.toString()
    } else {
      this.core.setCell(cellDom.id, rowDom.id, newValue)
    }

    //fire cell onchange event to client callback
    this.core.onCellChange(colIndex, rowIndex, newValue)
  }

}