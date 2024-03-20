import UI from "./ui/render.ts";
import { LightSheetOptions } from "./main.types.ts";
import Sheet from "./core/structure/sheet.ts";
import {
  generateColumnKey,
  generateRowKey,
} from "./core/structure/key/keyTypes.ts";
import { CellInfo } from "./core/structure/sheet.types.ts";

export default class LightSheet {
  ui: UI;
  options: LightSheetOptions;
  sheet: Sheet;
  onCellChange?;

  #defaultRowCount: number = 4;
  #defaultColCount: number = 4;

  constructor(targetElement: Element, options: LightSheetOptions) {
    this.options = options;
    this.sheet = new Sheet();
    this.ui = new UI(
      targetElement,
      this,
      this.options.data.length ?? this.#defaultRowCount,
      this.options.data.length ? this.options.data[0].length : this.#defaultColCount
    );
    this.initializeData();
    if (options.onCellChange) {
      this.onCellChange = options.onCellChange;
    }
  }

  initializeData() {
    debugger
    // Create header row and add headers
    const colLength = (this.options.data && this.options.data[0]?.length) ? this.options.data[0]?.length : this.#defaultColCount
    const rowLength = (this.options.data && this.options.data?.length) ? this.options.data?.length : this.#defaultRowCount
    const headerData = Array.from(
      { length: colLength + 1 }, // Adding 1 for the row number column
      (_, i) => (i === 0 ? "" : this.generateRowLabel(i)), // Generating row labels
    );
    this.ui.addHeader(headerData);

    for (let i = 0; i < rowLength; i++) {
      let item, itemCount = this.#defaultColCount;
      if (this.options.data && this.options.data.length) {
        item = this.options.data[i]
        itemCount = item.length
      }

      //create new row
      const rowDom = this.ui.addRow(i);

      for (let j = 0; j < itemCount; j++) {
        //if data is not empty add cell to core and render ui, otherwise render only ui
        if (item && item[j]) {
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

  generateRowLabel(rowIndex: number) {
    let label = "";
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    while (rowIndex > 0) {
      rowIndex--; // Adjust index to start from 0
      label = alphabet[rowIndex % 26] + label;
      rowIndex = Math.floor(rowIndex / 26);
    }
    return label || "A"; // Return "A" if index is 0
  }
}
