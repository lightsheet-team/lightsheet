import UI from "./ui/render.ts";
import { LightSheetOptions } from "./main.types.ts";
import Sheet from "./core/structure/sheet.ts";
import { CellInfo } from "./core/structure/sheet.types.ts";
import Events from "./core/event/events.ts";
import LightSheetHelper from "../utils/helpers.ts";
import { DefaultRowCount, DefaultColCount } from "../utils/constants.ts";
export default class LightSheet {
  #ui: UI;
  options: LightSheetOptions;
  sheet: Sheet;
  events: Events;
  onCellChange?;
  isReady: boolean = false;

  constructor(targetElement: Element, options: LightSheetOptions) {
    this.options = options;
    this.options.defaultColCount = options.defaultColCount ?? DefaultColCount;
    this.options.defaultRowCount = options.defaultRowCount ?? DefaultRowCount;
    this.events = new Events();
    this.sheet = new Sheet(this.events);
    this.#ui = new UI(targetElement, this, this.options.toolbarOptions);
    this.#initializeTable();
    if (options.onCellChange) {
      this.onCellChange = options.onCellChange;
    }

    if (options.onReady) options.onReady = this.options.onReady;
    this.onTableReady();
  }

  onTableReady() {
    this.isReady = true;
    if (this.options.onReady) this.options.onReady();
  }

  setReadOnly(isReadOnly: boolean) {
    this.#ui.setReadOnly(isReadOnly);
  }

  showToolbar(isShown: boolean) {
    this.#ui.showToolbar(isShown);
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
      let rowDom;
      for (let j = 0; j < colLength; j++) {
        const data =
          this.options.data[i] && this.options.data[i].length - 1 >= j
            ? this.options.data[i][j]
            : null;
        //if data is not empty add cell to core and render ui, otherwise render only ui
        if (data) {
          const cell = this.sheet.setCellAt(j, i, data);
          const rowKeyStr = cell.position.rowKey!.toString();
          rowDom = this.#ui.getRow(rowKeyStr)!;
        } else {
          if (!rowDom) {
            rowDom = this.#ui.addRow(i);
          }
          this.#ui.addCell(rowDom, j, i);
        }
      }
    }
  }

  setCellAt(columnKey: number, rowKey: number, value: any): CellInfo {
    return this.sheet.setCellAt(columnKey, rowKey, value);
  }
}
