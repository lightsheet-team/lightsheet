import UI from "./ui/render.ts";
import { LightSheetOptions } from "./main.types.ts";
import Sheet from "./core/structure/sheet.ts";
import {
  generateColumnKey,
  generateRowKey,
} from "./core/structure/key/keyTypes.ts";
import { PositionInfo } from "./core/structure/sheet.types.ts";

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

  setCell(columnKeyStr: string, rowKeyStr: string, value: any): PositionInfo {
    const colKey = generateColumnKey(columnKeyStr);
    const rowKey = generateRowKey(rowKeyStr);

    const cell = this.sheet.setCell(colKey, rowKey, value);
    if (
      !cell.value ||
      !cell.position.rowKey ||
      !cell.position.columnKey ||
      cell.value == value
    ) {
      return cell.position; // Cell value doesn't have a formula or was cleared.
    }

    // Resolved cell value != input value -> value is a formula and should be updated in the UI.
    this.ui.setCellValue(cell.value, rowKeyStr, columnKeyStr);
    return cell.position;
  }

  setCellAt(columnKey: number, rowKey: number, value: any): PositionInfo {
    return this.sheet.setCellAt(columnKey, rowKey, value).position;
  }
}
