import UI from './ui/render.ts'
import { LightSheetOptions } from './main.types.ts';
import Sheet from './definations/sheet.ts';
import { RowKey } from './definations/keyTypes.ts';

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

    this.ui = new UI(targetElement, this, 10, 10); //this should have 3 arguments?
    this.initializeData();
  }

  initializeData() {
    for (let i = 0; this.options.data.length; i++) {
      const data = this.options.data[i];
      let colIndex = 0
      let rowKey: string = '';
      const row = new Map()
      for (var key in data) {
        colIndex++
        if (data[key]) {
          const cell = this.sheet.setCellAt(colIndex, i, data[key])
          // cell = { cell, column, row }

          rowKey = cell.rowKey.toString()
          row.set(colIndex, cell)
        }
      }
      this.ui.addRow(rowKey.toString(), row)
    }
  }

  setCell(columnKey: string, rowKey: string, value: any) {
    this.sheet.setCell(columnKey, rowKey, value)
  }



}
