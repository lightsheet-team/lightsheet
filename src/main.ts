import UI from "./ui/render.ts";
import { LightSheetOptions } from "./main.types.ts";
import Sheet from "./core/structure/sheet.ts";
import { CellInfo } from "./core/structure/sheet.types.ts";
import Events from "./core/event/events.ts";
import SheetHolder from "./core/structure/sheetHolder.ts";
import { DefaultColCount, DefaultRowCount } from "./utils/constants.ts";
import ExpressionHandler from "./core/evaluation/expressionHandler.ts";
import { CellReference } from "./core/structure/cell/types.cell.ts";
import { SheetKey } from "./core/structure/key/keyTypes.ts";

export default class LightSheet {
  #ui: UI | undefined;
  options: LightSheetOptions;
  sheet: Sheet;
  sheetHolder: SheetHolder;
  events: Events;
  onCellChange?;
  isReady: boolean = false;

  /**
   * Create a new Lightsheet instance.
   * @param options Options for configuring the instance.
   * @param targetElement The element used for creating the table.
   */
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

      if (this.options.data && this.options.data.length > 0) {
        for (let rowI = 0; rowI < this.options.data.length; rowI++) {
          const rowData = this.options.data[rowI];
          for (let colI = 0; colI < rowData.length; colI++) {
            this.sheet.setCellAt(colI, rowI, rowData[colI]);
          }
        }
      } else {
        for (let index = 0; index < this.options.defaultColCount!; index++) {
          this.#ui.addColumn();
        }
        for (let index = 0; index < this.options.defaultRowCount!; index++) {
          this.#ui.addRow();
        }
      }
    }

    if (options.onCellChange) {
      this.onCellChange = options.onCellChange;
    }

    if (options.onReady) options.onReady = this.options.onReady;
    this.onTableReady();
  }

  /**
   * Register a function to be used in formulas.
   * @param name The name of the function, case-insensitive.
   * @param func The function to be called. The first parameter should accept a CellReference, which contains information about the cell the formula is in.
   */
  static registerFunction(
    name: string,
    func: (cellRef: CellReference, ...args: any[]) => string,
  ) {
    ExpressionHandler.registerFunction(name, func);
  }

  private onTableReady() {
    this.isReady = true;
    if (this.options.onReady) this.options.onReady();
  }

  /**
   * Set the table's readonly state. When set to true, the user cannot edit the table and the formula bar is hidden if enabled.
   * @param isReadOnly
   */
  setReadOnly(isReadOnly: boolean) {
    this.#ui?.setReadOnly(isReadOnly);
    this.options.isReadOnly = isReadOnly;
  }

  /**
   * Set the toolbar's visibility. When set to false, the toolbar element is destroyed.
   * @param isShown
   */
  showToolbar(isShown: boolean) {
    this.#ui?.showToolbar(isShown);
  }

  /**
   * Get the unique identifier, a SheetKey, of this instance.
   */
  getKey(): SheetKey {
    return this.sheet.key;
  }

  /**
   * Get this instance's name, used when referring to the sheet in formulas ("=SheetName!A1")
   */
  getName(): string {
    return this.options.sheetName;
  }
  /**
   * Set the value of a cell at the give position.
   * @param columnIndex The index of the column, starting from 0.
   * @param rowIndex The index of the row, starting from 0.
   * @param value The new contents of the cell. If starting with "=", the value is treated as a formula.
   */
  setCellAt(columnIndex: number, rowIndex: number, value: any): CellInfo {
    return this.sheet.setCellAt(columnIndex, rowIndex, value.toString());
  }
}
