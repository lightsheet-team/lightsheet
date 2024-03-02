import UI from "./ui/render.ts";
import { LightSheetOptions } from "./main.types.ts";
import Sheet from "./definations/sheet.ts";
import { generateColumnKey, generateRowKey } from "./definations/keyTypes.ts";

export default class LightSheet {
  ui: UI;
  options: LightSheetOptions;
  sheet: Sheet;
  onCellChange?;

  constructor(targetElement: Element, options: LightSheetOptions) {
    this.options = options;
    this.sheet = new Sheet();
    this.ui = new UI(
      targetElement,
      this,
      this.options.data.length,
      this.options.data[0].length,
    );
    this.initializeData();
    if (options.onCellChange) {
      this.onCellChange = options.onCellChange;
    }
  }

  initializeData() {
    for (let i = 0; i < this.options.data.length; i++) {
      const item = this.options.data[i];
      //create new row
      const rowDom = this.ui.addRow();

      for (let j = 0; j < item.length; j++) {
        //if data is not empty add cell to core and render ui, otherwise render only ui
        if (item[j]) {
          const cell = this.sheet.setCellAt(j, i, item[j]);
          if (!rowDom.id) rowDom.id = cell.rowKey.toString();
          this.ui.addColumn(rowDom, j, i, item[j], cell.columnKey.toString());
        } else {
          this.ui.addColumn(rowDom, j, i, "");
        }
      }
    }
  }

  setCell(columnKey: string, rowKey: string, value: any) {
    this.sheet.setCell(
      generateColumnKey(columnKey),
      generateRowKey(rowKey),
      value,
    );
  }

  setCellAt(columnKey: number, rowKey: number, value: any) {
    return this.sheet.setCellAt(columnKey, rowKey, value);
  }
}
