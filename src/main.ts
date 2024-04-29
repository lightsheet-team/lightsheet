import UI from "./ui/render.ts";
import { LightSheetOptions } from "./main.types.ts";
import Sheet from "./core/structure/sheet.ts";
import {
  CellInfo,
  Format,
  GroupTypes,
  StyleInfo,
} from "./core/structure/sheet.types.ts";
import Events from "./core/event/events.ts";
import SheetHolder from "./core/structure/sheetHolder.ts";
import { DefaultColCount, DefaultRowCount } from "./utils/constants.ts";
import ExpressionHandler from "./core/evaluation/expressionHandler.ts";
import { CellReference } from "./core/structure/cell/types.cell.ts";
import NumberFormatter from "./core/evaluation/numberFormatter.ts";
import { getRowColFromCellRef } from "./utils.ts";
import LightSheetHelper from "./utils/helpers.ts";

export default class LightSheet {
  #ui: UI | undefined;
  options: LightSheetOptions;
  sheet: Sheet;
  sheetHolder: SheetHolder;
  events: Events;
  style?: any = null;
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
    this.style = options.style;
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
    this.initializeStyle();
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

  getFormatter(type: string, options?: any) {
    if (type == "number") {
      return new NumberFormatter(options.decimal);
    }
    return;
  }

  setCss(position: string, css: string) {
    const { row, col } = getRowColFromCellRef(position);
    const mappedCss = css
      ? LightSheetHelper.GenerateStyleMapFromString(css)
      : null;
    if (row == null && col == null) {
      return;
    } else if (row != null && col != null) {
      this.sheet.setCellCss(col, row, mappedCss!);
    } else if (row != null) {
      this.sheet.setGroupCss(row, GroupTypes.Row, mappedCss!);
    } else if (col != null) {
      this.sheet.setGroupCss(col, GroupTypes.Column, mappedCss!);
    }
  }

  clearCss(position: string) {
    this.setCss(position, "");
  }

  setFormatting(position: string, format: Format) {
    const { row, col } = getRowColFromCellRef(position);
    const formatter = format
      ? this.getFormatter(format.type, format.options)
      : null;
    if (!formatter) return;
    if (row == null && col == null) {
      return;
    } else if (row != null && col != null) {
      this.sheet.setCellFormatter(col, row, formatter);
    } else if (row != null) {
      this.sheet.setGroupFormatter(row, GroupTypes.Row, formatter);
    } else if (col != null) {
      this.sheet.setGroupFormatter(col, GroupTypes.Column, formatter);
    }
  }

  clearFormatter(position: string) {
    const { row, col } = getRowColFromCellRef(position);
    if (row == null && col == null) {
      return;
    } else if (row != null && col != null) {
      this.sheet.setCellFormatter(col, row);
    } else if (row != null) {
      this.sheet.setGroupFormatter(row, GroupTypes.Row);
    } else if (col != null) {
      this.sheet.setGroupFormatter(col, GroupTypes.Column);
    }
  }

  private initializeStyle() {
    this.style?.forEach((item: StyleInfo) => {
      if (item.css) this.setCss(item.position, item.css!);
      if (item.format) this.setFormatting(item.position, item.format);
    });
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
