import UI from "./ui/render.ts";
import { LightSheetOptions } from "./main.types.ts";
import Sheet from "./core/structure/sheet.ts";
import { CellInfo } from "./core/structure/sheet.types.ts";
import Events from "./core/event/events.ts";
import SheetHolder from "./core/structure/sheetHolder.ts";
import { DefaultColCount, DefaultRowCount } from "./utils/constants.ts";
import ExpressionHandler from "./core/evaluation/expressionHandler.ts";
import { CellReference } from "./core/structure/cell/types.cell.ts";

export default class LightSheet {
  #ui: UI | undefined;
  options: LightSheetOptions;
  sheet: Sheet;
  sheetHolder: SheetHolder;
  events: Events;
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
      this.#ui = new UI(targetElement, this, this.options.toolbarOptions);

      for (let index = 0; index < this.options.defaultColCount!; index++) {
        this.#ui.addColumn();
      }

      for (let index = 0; index < this.options.defaultRowCount!; index++) {
        this.#ui.addRow();
      }

      if (this.options.data) {
        for (let rowI = 0; rowI < this.options.data.length; rowI++) {
          const rowData = this.options.data[rowI];
          for (let colI = 0; colI < rowData.length; colI++) {
            this.sheet.setCellAt(colI, rowI, rowData[colI]);
          }
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

  onTableReady() {
    this.isReady = true;
    if (this.options.onReady) this.options.onReady();
  }

  setReadOnly(isReadOnly: boolean) {
    this.#ui?.setReadOnly(isReadOnly);
    this.options.isReadOnly = isReadOnly;
  }

  showToolbar(isShown: boolean) {
    this.#ui?.showToolbar(isShown);
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
}
