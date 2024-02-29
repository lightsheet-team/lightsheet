import UI from './ui/render.ts'
import { LightSheetOptions } from './main.types.ts';
import Sheet from './definations/sheet.ts';
import { ColumnKey, RowKey } from './definations/keyTypes.ts';

export default class LightSheet {
  ui: UI
  options: LightSheetOptions;
  sheet: Sheet

  constructor(targetElement: Element | HTMLDocument, options: LightSheetOptions) {
    this.options = options;
    this.sheet = new Sheet();

    if (!(targetElement instanceof Element || targetElement instanceof HTMLDocument)) {
      console.error('Jspreadsheet: el is not a valid DOM element');
    }

    this.ui = new UI(targetElement, this, this.options.data.length, this.options.data[0].length); //this should have 3 arguments?
    this.initializeData();
  }

  initializeData() {
    for (let i = 0; i < this.options.data.length; i++) {
      const rowData = this.options.data[i];
      let rowKey: string = '';
      const row = new Map()
      for (let j = 0; j < rowData.length; j++) {
        if (rowData[j]) {
          const cell = this.sheet.setCellAt(j, i, rowData[j])
          rowKey = cell.rowKey.toString()
          row.set(j, { cell, value: rowData[j] })
        }
      }
      this.ui.addRow(rowKey.toString(), row, i)
    }
  }

  setCell(columnKey: string, rowKey: string, value: any) {
    const column = this.sheet.columns.get(new ColumnKey(columnKey))!!
    const row = this.sheet.rows.get(new RowKey(rowKey))!!
    this.sheet.setCell(column, row, value)
  }
  setCellAt(columnKey: number, rowKey: number, value: any) {
    return this.sheet.setCellAt(columnKey, rowKey, value)
  }

}
