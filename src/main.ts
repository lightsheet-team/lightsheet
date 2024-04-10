import UI from "./ui/render.ts";
import { LightSheetOptions } from "./main.types.ts";
import Sheet from "./core/structure/sheet.ts";
import { CellInfo } from "./core/structure/sheet.types.ts";
import Events from "./core/event/events.ts";
import LightSheetHelper from "../utils/helpers.ts";
import { DefaultRowCount, DefaultColCount } from "../utils/constants.ts";
import SheetHolder from "./core/structure/sheetHolder.ts";

export default class LightSheet {
  #ui: UI;
  options: LightSheetOptions;
  sheet: Sheet;
  sheetHolder: SheetHolder;
  events: Events;
  onCellChange?;
  isReady: boolean = false;

  constructor(targetElement: Element, options: LightSheetOptions) {
    this.options = options;
    this.options.defaultColCount = options.defaultColCount ?? DefaultColCount;
    this.options.defaultRowCount = options.defaultRowCount ?? DefaultRowCount;
    this.events = new Events();
    this.sheetHolder = this.registerSheet();
    this.sheet = new Sheet(this.sheetHolder, this.events);
    this.sheetHolder.addSheet(this);
    this.#ui = new UI(targetElement, this);
    this.#initializeTable();

    if (options.onCellChange) {
      this.onCellChange = options.onCellChange;
    }

    if (options.onReady) options.onReady = this.options.onReady;
    this.onTableReady();
  }

  setReadOnly(isReadOnly: boolean) {
    this.#ui.setReadOnly(isReadOnly);
  }

  #initializeTable() {
    // Create header row and add headers
    const rowLength = this.options.data?.length
      ? this.options.data?.length
      : this.options.defaultRowCount;
    let colLength = this.options.data?.reduce(
      (total, item) => (total > item.length ? total : item.length),
      0,
    );
    if (!colLength) colLength = this.options.defaultColCount;

    const headerData = Array.from(
      { length: colLength + 1 }, // Adding 1 for the row number column
      (_, i) => (i === 0 ? "" : LightSheetHelper.GenerateRowLabel(i)), // Generating row labels
    );

    this.#ui.addHeader(headerData);

    for (let i = 0; i < rowLength!; i++) {
      //create new row
      const rowDom = this.#ui.addRow(i);
      for (let j = 0; j < colLength; j++) {
        const data =
          this.options.data[i] && this.options.data[i].length - 1 >= j
            ? this.options.data[i][j]
            : null;
        //if data is not empty add cell to core and render ui, otherwise render only ui
        if (data) {
          const cell = this.sheet.setCellAt(j, i, data);
          const rowKeyStr = cell.position.rowKey!.toString();
          const columnKeyStr = cell.position.columnKey!.toString();

          if (!rowDom.id) rowDom.id = rowKeyStr;
          this.#ui.addCell(rowDom, j, i, cell.resolvedValue, columnKeyStr);
        } else {
          this.#ui.addCell(rowDom, j, i, "");
        }
      }
    }
  }

  onTableReady() {
    this.isReady = true;
    if (this.options.onReady) this.options.onReady();
  }

  registerSheet(): SheetHolder {
    if (!window.sheetHolder) {
      window.sheetHolder = new SheetHolder();
    }
    return window.sheetHolder;
  }

  getKey() {
    return this.sheet.key;
  }

  getName() {
    return this.options.sheetName;
  }

  setCellAt(columnKey: number, rowKey: number, value: any): CellInfo {
    return this.sheet.setCellAt(columnKey, rowKey, value);
  }
}
