import UI from "./ui/render.ts";
import { LightSheetOptions } from "./main.types.ts";
import Sheet from "./core/structure/sheet.ts";
import { CellInfo } from "./core/structure/sheet.types.ts";
import Events from "./core/event/events.ts";
import SheetHolder from "./core/structure/sheetHolder.ts";
import { DefaultColCount, DefaultRowCount } from "./utils/constants.ts";
import LightSheetHelper from "./utils/helpers.ts";
import EventType from "./core/event/eventType.ts";
import EventState from "./core/event/eventState.ts";
import { ListenerFunction } from "./core/event/events.ts";
import { ColumnKey, RowKey } from "./core/structure/key/keyTypes.ts";
import CellStyle from "./core/structure/cellStyle.ts";

export default class LightSheet {
  #ui: UI | undefined;
  options: LightSheetOptions;
  private sheet: Sheet;
  sheetHolder: SheetHolder;
  private events: Events;
  onCellChange?;
  isReady: boolean = false;

  constructor(
    options: LightSheetOptions,
    targetElement: Element | null = null,
  ) {
    this.options = {
      data: [],
      defaultColCount: DefaultColCount,
      defaultRowCount: DefaultRowCount,
      ...options,
    };
    this.events = new Events();
    this.sheetHolder = SheetHolder.getInstance();
    this.sheet = new Sheet(options.sheetName, this.events);

    if (targetElement) {
      this.#ui = new UI(targetElement, this, this.options.toolbarOptions);
      this.#initializeTable();
    }

    if (options.onCellChange) {
      this.onCellChange = options.onCellChange;
    }

    if (options.onReady) options.onReady = this.options.onReady;
    this.onTableReady();
  }

  addEventListener(
    eventType: EventType,
    callback: ListenerFunction,
    eventState: EventState = EventState.POST_EVENT,
    once: boolean = false,
  ): void {
    this.events.addEventListener(eventType, callback, eventState, once);
  }

  removeEventListener(
    eventType: EventType,
    callback: ListenerFunction,
    eventState: EventState = EventState.POST_EVENT,
  ): void {
    this.events.removeEventListener(eventType, callback, eventState)
  }

  onTableReady() {
    this.isReady = true;
    if (this.options.onReady) this.options.onReady();
  }

  setReadOnly(isReadOnly: boolean) {
    this.#ui?.setReadOnly(isReadOnly);
  }

  showToolbar(isShown: boolean) {
    this.#ui?.showToolbar(isShown);
  }

  #initializeTable() {
    if (!this.#ui || !this.options.data) return;

    // Create header row and add headers
    const rowLength = this.options.data.length
      ? this.options.data.length
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

  getKey() {
    return this.sheet.key;
  }

  getName() {
    return this.options.sheetName;
  }

  setCellAt(columnKey: number, rowKey: number, value: any): CellInfo {
    return this.sheet.setCellAt(columnKey, rowKey, value.toString());
  }


  getCellInfoAt(colPos: number, rowPos: number): CellInfo | null {
    return this.sheet.getCellInfoAt(colPos, rowPos);
  }

  getRowIndex(rowKey: RowKey): number | undefined {
    return this.sheet.getRowIndex(rowKey);
  }

  getColumnIndex(colKey: ColumnKey): number | undefined {
    return this.sheet.getColumnIndex(colKey);
  }

  getCellStyle(colKey?: ColumnKey, rowKey?: RowKey): CellStyle {
    return this.sheet.getCellStyle(colKey, rowKey);
  }

  setRowStyle(rowkey: RowKey, cellStyle: CellStyle): boolean{
    return this.sheet.setRowStyle(rowkey, cellStyle)
  }

  setColumnStyle(columnKey: ColumnKey, cellStyle: CellStyle): boolean{
    return this.sheet.setColumnStyle(columnKey, cellStyle)
  }

  setCellStyle(
    colKey: ColumnKey,
    rowKey: RowKey,
    style: CellStyle | null,
  ): boolean{
    return this.sheet.setCellStyle(colKey, rowKey, style)
  }

  moveColumn(from: number, to: number): boolean {
    return this.sheet.moveColumn(from, to);
  }

  moveRow(from: number, to: number): boolean {
    return this.sheet.moveRow(from, to);
  }

  insertColumn(position: number): boolean {
    return this.sheet.insertColumn(position)
  }

  insertRow(position: number): boolean {
    return this.sheet.insertRow(position);
  }

  deleteColumn(position: number): boolean {
    return this.sheet.deleteColumn(position);
  }

  deleteRow(position: number): boolean {
    return this.sheet.deleteRow(position);
  }
}
