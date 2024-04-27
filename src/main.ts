import UI from "./ui/render.ts";
import { LightSheetOptions } from "./main.types.ts";
import Sheet from "./core/structure/sheet.ts";
import { CellInfo } from "./core/structure/sheet.types.ts";
import Events from "./core/event/events.ts";
import { ListenerFunction } from "./core/event/events.ts";
import EventState from "./core/event/eventState.ts";
import EventType from "./core/event/eventType.ts";
import SheetHolder from "./core/structure/sheetHolder.ts";
import { DefaultColCount, DefaultRowCount } from "./utils/constants.ts";
import ExpressionHandler from "./core/evaluation/expressionHandler.ts";
import { CellReference } from "./core/structure/cell/types.cell.ts";
import { RowKey, ColumnKey } from "./core/structure/key/keyTypes.ts";
import CellStyle from "./core/structure/cellStyle.ts";
import { Coordinate } from "./utils/common.types.ts";

export default class LightSheet {
  private ui: UI | undefined;
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
      isReadOnly: false,
      ...options,
    };
    this.events = new Events();
    this.sheetHolder = SheetHolder.getInstance();
    this.sheet = new Sheet(options.sheetName, this.events);

    if (targetElement) {
      this.ui = new UI(targetElement, this.options, this.events);

      if (this.options.data && this.options.data.length > 0) {
        for (let rowI = 0; rowI < this.options.data.length; rowI++) {
          const rowData = this.options.data[rowI];
          for (let colI = 0; colI < rowData.length; colI++) {
            this.sheet.setCellAt(colI, rowI, rowData[colI]);
          }
        }
      } else {
        for (let index = 0; index < this.options.defaultColCount!; index++) {
          this.ui.addColumn();
        }
        for (let index = 0; index < this.options.defaultRowCount!; index++) {
          this.ui.addRow();
        }
      }
    }

    if (options.onCellChange) {
      this.onCellChange = options.onCellChange;
    }

    if (options.onReady) options.onReady = this.options.onReady;
    this.onTableReady();
  }

  static registerFunction(
    name: string,
    func: (cellRef: CellReference, ...args: any[]) => string,
  ) {
    ExpressionHandler.registerFunction(name, func);
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
    this.events.removeEventListener(eventType, callback, eventState);
  }

  onTableReady() {
    this.isReady = true;
    if (this.options.onReady) this.options.onReady();
  }

  setReadOnly(isReadOnly: boolean) {
    this.ui?.setReadOnly(isReadOnly);
    this.options.isReadOnly = isReadOnly;
  }

  showToolbar(isShown: boolean) {
    this.ui?.showToolbar(isShown);
  }

  getKey() {
    return this.sheet.key;
  }

  getName() {
    return this.options.sheetName;
  }

  setCellAt(columnIndex: number, rowIndex: number, value: any): CellInfo {
    return this.sheet.setCellAt(columnIndex, rowIndex, value.toString());
  }

  setCell(colKey: ColumnKey, rowKey: RowKey, formula: string): CellInfo | null {
    return this.sheet.setCell(colKey, rowKey, formula);
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

  setCellStyle(
    colKey: ColumnKey,
    rowKey: RowKey,
    style: CellStyle | null,
  ): boolean {
    return this.sheet.setCellStyle(colKey, rowKey, style);
  }

  setRowStyle(rowkey: RowKey, cellStyle: CellStyle): boolean {
    return this.sheet.setRowStyle(rowkey, cellStyle);
  }

  setColumnStyle(columnKey: ColumnKey, cellStyle: CellStyle): boolean {
    return this.sheet.setColumnStyle(columnKey, cellStyle);
  }

  moveColumn(from: number, to: number): boolean {
    return this.sheet.moveColumn(from, to);
  }

  moveRow(from: number, to: number): boolean {
    return this.sheet.moveRow(from, to);
  }

  moveCell(from: Coordinate, to: Coordinate, moveStyling: boolean = true) {
    this.sheet.moveCell(from, to, moveStyling);
  }

  insertColumn(position: number): boolean {
    return this.sheet.insertColumn(position);
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

  exportData(): Map<number, Map<number, string>> {
    return this.sheet.exportData();
  }
}
