import UI from "./ui/render.ts";
import { LightSheetOptions } from "./main.types.ts";
import Sheet from "./core/structure/sheet.ts";
import { CellInfo, Format, StyleInfo } from "./core/structure/sheet.types.ts";
import Events from "./core/event/events.ts";
import SheetHolder from "./core/structure/sheetHolder.ts";
import { DefaultColCount, DefaultRowCount } from "./utils/constants.ts";
import LightSheetHelper from "./utils/helpers.ts";
import ExpressionHandler from "./core/evaluation/expressionHandler.ts";
import { CellReference } from "./core/structure/cell/types.cell.ts";
import NumberFormatter from "./core/evaluation/numberFormatter.ts";
import { getRowColFromCellRef } from "./utlis.ts";

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
      this.#initializeTable();
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
    if (type == 'number') {
      return new NumberFormatter(options.decimal)
    }
    return
  }

  clearCss(position: string) {
    const { row, col } = getRowColFromCellRef(position);
    if (row == null && col == null) {
      return;
    } else if (row != null && col != null) {
      this.sheet.clearCellCss(col, row);
    }
    else if (row != null) {
      this.sheet.clearRowCss(row);
    } else if (col != null) {
      this.sheet.clearColumnCss(col);
    }
  }

  clearFormatter(position: string) {
    const { row, col } = getRowColFromCellRef(position);
    if (row == null && col == null) {
      return;
    } else if (row != null && col != null) {
      this.sheet.clearCellFormatter(col, row);
    }
    else if (row != null) {
      this.sheet.clearRowFormatter(row);
    } else if (col != null) {
      this.sheet.clearColumnFormatter(col);
    }
  }

  setCss(position: string, css: string) {
    const { row, col } = getRowColFromCellRef(position);
    const mappedCss = css ? LightSheetHelper.GenerateStyleMapFromString(css) : null;
    if (row == null && col == null) {
      return;
    } else if (row != null && col != null) {
      this.sheet.setCellCss(col, row, mappedCss!);
    } else if (row != null) {
      this.sheet.setRowCss(row, mappedCss!);
    } else if (col != null) {
      this.sheet.setColumnCss(col, mappedCss!);
    }
  }

  setFormatting(position: string, format: Format) {
    const { row, col } = getRowColFromCellRef(position);
    const formatter = format ? this.getFormatter(format.type, format.options) : null
    if (!formatter) return
    if (row == null && col == null) {
      return;
    } else if (row != null && col != null) {
      this.sheet.setCellFormatter(col, row, formatter);
    } else if (row != null) {
      this.sheet.setRowFormatter(row, formatter);
    } else if (col != null) {
      this.sheet.setColumnFormatter(col, formatter);
    }
  }

  private initializeStyle() {
    this.style?.forEach((item: StyleInfo) => {
      if (item.css)
        this.setCss(item.position, item.css!);
      if (item.format)
        this.setFormatting(item.position, item.format);
    });
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
      (_, i) => (i === 0 ? "" : LightSheetHelper.generateColumnLabel(i)), // Generating column labels
    );

    this.#ui.addHeader(headerData);

    for (let i = 0; i < rowLength!; i++) {
      for (let j = 0; j < colLength; j++) {
        const data =
          this.options.data[i] && this.options.data[i].length - 1 >= j
            ? this.options.data[i][j]
            : null;
        //if data is not empty add cell to core and render ui, otherwise render only ui
        if (data) {
          this.sheet.setCellAt(j, i, data);
        } else {
          this.#ui.getRowDom(i) ?? this.#ui.addRow(i)
          this.#ui.addCell(j, i, "");
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
}
