import UI from "./ui/render.ts";
import { LightSheetOptions } from "./main.types.ts";
import Sheet from "./core/structure/sheet.ts";
import {
  generateColumnKey,
  generateRowKey,
} from "./core/structure/key/keyTypes.ts";
import { CellInfo } from "./core/structure/sheet.types.ts";
import { generateRowLabel, getRowColFromCellRef } from "./utlis.ts";

export default class LightSheet {
  ui: UI;
  options: LightSheetOptions;
  sheet: Sheet;
  style: any = null;
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
    this.style = options.style;
    this.initializeData();
    if (options.onCellChange) {
      this.onCellChange = options.onCellChange;
    }
  }

  initializeStyle() {
    for (const [key, value] of Object.entries(this.style)) {
      const { row, col } = getRowColFromCellRef(key)
      if (row == null && col == null) {
        continue;
      } else if (row != null && col != null) {
        // this.sheet.setCellStyle(row, col, value as string);
      } else if (row != null) {

      } else if (col != null) {

      }
    }

  }

  initializeData() {
    // Create header row and add headers
    const headerData = Array.from(
      { length: this.options.data[0].length + 1 }, // Adding 1 for the row number column
      (_, i) => (i === 0 ? "" : generateRowLabel(i)), // Generating row labels
    );
    this.ui.addHeader(headerData);

    for (let i = 0; i < this.options.data.length; i++) {
      const item = this.options.data[i];
      //create new row
      const rowDom = this.ui.addRow(i);

      for (let j = 0; j < item.length; j++) {
        //if data is not empty add cell to core and render ui, otherwise render only ui
        if (item[j]) {
          const cell = this.sheet.setCellAt(j, i, item[j]);
          const rowKeyStr = cell.position.rowKey!.toString();
          const columnKeyStr = cell.position.columnKey!.toString();

          if (!rowDom.id) rowDom.id = rowKeyStr;
          this.ui.addColumn(rowDom, j, i, cell.value, columnKeyStr);
        } else {
          this.ui.addColumn(rowDom, j, i, "");
        }
      }
    }
  }

  setCell(columnKeyStr: string, rowKeyStr: string, value: any): CellInfo {
    const colKey = generateColumnKey(columnKeyStr);
    const rowKey = generateRowKey(rowKeyStr);

    return this.sheet.setCell(colKey, rowKey, value);
  }

  setCellAt(columnKey: number, rowKey: number, value: any): CellInfo {
    return this.sheet.setCellAt(columnKey, rowKey, value);
  }
}
