import UI from "./ui/render.ts";
import { LightSheetOptions } from "./main.types.ts";
import Sheet from "./core/structure/sheet.ts";
import { CellInfo } from "./core/structure/sheet.types.ts";
import Events from "./core/event/events.ts";
import SheetHolder from "./core/structure/sheetHolder.ts";
import { DefaultColCount, DefaultRowCount } from "./utils/constants.ts";
import ExpressionHandler from "./core/evaluation/expressionHandler.ts";
import { CellReference } from "./core/structure/cell/types.cell.ts";
import CellStyle from "./core/structure/cellStyle.ts";
import LightSheetHelper from "./utils/helpers.ts";

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

    this.parseStyleOptions(options.style || []);
    if (options.onReady) options.onReady = this.options.onReady;
    this.onTableReady();
  }

  private parseStyleOptions(styleConfig: any[]) {
    for (const styleEntry of styleConfig) {
      const cssStr: string = styleEntry.css;
      /* TODO Implement formatter parsing
      const formatterType = styleEntry.format?.type;
      const formatterParams = styleEntry.format?.params;
       */

      let position;
      try {
        position = LightSheetHelper.parseSymbolToPosition(
          styleEntry.position,
          true,
        );
      } catch (e) {
        console.error("Invalid position while parsing style options: ", e);
        return false;
      }

      const cssRules = cssStr.split(";").filter((s) => s !== "");
      const styleMap = new Map<string, string>();
      for (const rule of cssRules) {
        const [key, value] = rule.split(":").map((s) => s.trim());
        styleMap.set(key, value);
      }

      const style = new CellStyle(styleMap);

      if (position.colIndex == -1) {
        this.sheet.setRowStyleAt(position.rowIndex!, style);
      } else if (position.rowIndex == -1) {
        this.sheet.setColumnStyleAt(position.colIndex!, style);
      } else {
        this.sheet.setCellStyleAt(position.colIndex, position.rowIndex, style);
      }
    }
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
