import UI from "./view/view.ts";
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
import {
  GenerateStyleMapFromString,
  GetRowColFromCellRef,
} from "./utils/helpers.ts";

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
    const { rowIndex, columnIndex } = GetRowColFromCellRef(position);
    const mappedCss = css ? GenerateStyleMapFromString(css) : null;
    if (rowIndex == null && columnIndex == null) {
      return;
    } else if (rowIndex != null && columnIndex != null) {
      this.sheet.setCellCss(columnIndex, rowIndex, mappedCss!);
    } else if (rowIndex != null) {
      this.sheet.setGroupCss(rowIndex, GroupTypes.Row, mappedCss!);
    } else if (columnIndex != null) {
      this.sheet.setGroupCss(columnIndex, GroupTypes.Column, mappedCss!);
    }
  }

  clearCss(position: string) {
    this.setCss(position, "");
  }

  setFormatting(position: string, format: Format) {
    const { rowIndex, columnIndex } = GetRowColFromCellRef(position);
    const formatter = format
      ? this.getFormatter(format.type, format.options)
      : null;
    if (!formatter) return;
    if (rowIndex == null && columnIndex == null) {
      return;
    } else if (rowIndex != null && columnIndex != null) {
      this.sheet.setCellFormatter(columnIndex, rowIndex, formatter);
    } else if (rowIndex != null) {
      this.sheet.setGroupFormatter(rowIndex, GroupTypes.Row, formatter);
    } else if (columnIndex != null) {
      this.sheet.setGroupFormatter(columnIndex, GroupTypes.Column, formatter);
    }
  }

  clearFormatter(position: string) {
    const { rowIndex, columnIndex } = GetRowColFromCellRef(position);
    if (rowIndex == null && columnIndex == null) {
      return;
    } else if (rowIndex != null && columnIndex != null) {
      this.sheet.setCellFormatter(columnIndex, rowIndex);
    } else if (rowIndex != null) {
      this.sheet.setGroupFormatter(rowIndex, GroupTypes.Row);
    } else if (columnIndex != null) {
      this.sheet.setGroupFormatter(columnIndex, GroupTypes.Column);
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
