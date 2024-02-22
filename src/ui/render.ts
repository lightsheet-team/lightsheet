export default class UI {
  tableEl: any;
  tableBodyDom: any
  rowCount: number;
  colCount: number;
  constructor(el: Element | HTMLDocument, rowCount: number, colCount: number) {
    this.tableEl = el;
    this.colCount = colCount;
    this.rowCount = rowCount;
  }

  initializeTableContainer() {
    const tableContainerDom = document.createElement('table');
    this.tableBodyDom = document.createElement('tbody');
    tableContainerDom.appendChild(this.tableBodyDom);
  }
  //rowCells= {rowKey,[{cell, columnKey},{cell, columnKey},{cell, columnKey},{cell, columnKey}]}
  addRow(rowKey: string, rowCells: Map<number, any>) {
    const rowDom = document.createElement('tr')
    rowDom.id = rowKey
    this.tableBodyDom.appendChild(rowDom)
    for (let i = 0; i < this.colCount; i++) {
      const cellDom = document.createElement('td')
      cellDom.id = `${rowKey}-${i}`
      const inputDom = document.createElement('input')
      inputDom.value = ''
      cellDom.appendChild(inputDom);
      if (rowCells.has(i)) {
        cellDom.id = rowCells.get(i).columnKey
        inputDom.value = rowCells.get(i).cell.value
      }
    }

  }

}