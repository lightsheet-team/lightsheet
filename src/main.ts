import UI from "./ui/render.ts";
import { LightSheetOptions } from "./main.types.ts";
import Sheet from "./core/structure/sheet.ts";
import { CellInfo } from "./core/structure/sheet.types.ts";
import Events from "./core/event/events.ts";
import SheetHolder from "./core/structure/sheetHolder.ts";
import { DefaultColCount, DefaultRowCount } from "./utils/constants.ts";
import LightSheetHelper from "./utils/helpers.ts";
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
      ...options,
    };
    this.events = new Events();
    this.sheetHolder = SheetHolder.getInstance();
    this.sheet = new Sheet(options.sheetName, this.events);

    if (targetElement) {
      this.#ui = new UI(targetElement, this, this.options.toolbarOptions);
      this.initializeTable();
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
  }

  /**
   * Set the toolbar's visibility. When set to false, the toolbar element is destroyed.
   * @param isShown
   */
  showToolbar(isShown: boolean) {
    this.#ui?.showToolbar(isShown);
  }

  private initializeTable() {
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
      (_, i) => (i === 0 ? "" : LightSheetHelper.generateColumnLabel(i)), // Generating column labels
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
   * @param column The index of the column, starting from 0.
   * @param row The index of the row, starting from 0.
   * @param value The new contents of the cell. If starting with "=", the value is treated as a formula.
   */
  setCellAt(column: number, row: number, value: string): CellInfo {
    return this.sheet.setCellAt(column, row, value.toString());
  }
}
