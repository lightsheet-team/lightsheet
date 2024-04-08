import {
  create,
  parseDependencies,
  addDependencies,
  subtractDependencies,
  multiplyDependencies,
  divideDependencies,
  SymbolNodeDependencies,
  FunctionNodeDependencies,
  sumDependencies,
} from "mathjs/number";

import Sheet from "../structure/sheet.ts";
import { CellPosition, EvaluationResult } from "./expressionHandler.types.ts";

import { CellState } from "../structure/cell/cellState.ts";

const math = create({
  parseDependencies,
  addDependencies,
  subtractDependencies,
  multiplyDependencies,
  divideDependencies,
  SymbolNodeDependencies,
  FunctionNodeDependencies,
  sumDependencies,
});

export default class ExpressionHandler {
  sheet: Sheet;

  private cellRefHolder: Array<CellPosition>;
  private rawValue: string;

  constructor(sheet: Sheet, rawValue: string) {
    this.sheet = sheet; // TODO The scope of this class should be all sheets, not just one.

    this.rawValue = rawValue;
    this.cellRefHolder = [];

    math.FunctionNode.onUndefinedFunction = (name: string) =>
      this.resolveFunction(name);

    //Configure mathjs to allow colons in symbols.
    const isAlphaOriginal = math.parse.isAlpha;
    math.parse.isAlpha = (c: string, cPrev: string, cNext: string): boolean => {
      return isAlphaOriginal(c, cPrev, cNext) || c == ":";
    };

    math.SymbolNode.onUndefinedSymbol = (name: string) =>
      this.resolveSymbol(name);
  }

  evaluate(): EvaluationResult | null {
    if (!this.rawValue.startsWith("="))
      return { value: this.rawValue, references: [] };

    const expression = this.rawValue.substring(1);
    try {
      const parsed = math.parse(expression);
      const value = parsed.evaluate().toString();
      const references = this.cellRefHolder.slice();
      this.cellRefHolder = [];
      return { value: value, references: references };
    } catch (e) {
      return null;
    }
  }

  private resolveFunction(name: string): any {
    console.log("Undefined function: " + name);
    return this.dummyFunction; // TODO Implement defining custom functions and look up the handle here.
  }

  private dummyFunction(): any {
    return "";
  }

  private resolveSymbol(symbol: string): any {
    // TODO only handling references within one sheet for now.
    if (symbol.includes(":")) {
      const rangeParts = symbol.split(":").filter((s) => s !== "");
      if (rangeParts.length != 2) throw new Error("Invalid range: " + symbol);

      const start = ExpressionHandler.parseSymbolToPosition(rangeParts[0]);
      const end = ExpressionHandler.parseSymbolToPosition(rangeParts[1]);

      const values: string[] = [];
      for (let i = start.rowIndex; i <= end.rowIndex; i++) {
        for (let j = start.colIndex; j <= end.colIndex; j++) {
          const cellInfo = this.sheet.getCellInfoAt(j, i);
          if (cellInfo && cellInfo.state != CellState.OK)
            throw new Error("Invalid cell reference: " + symbol);

          this.cellRefHolder.push({ columnIndex: j, rowIndex: i });
          values.push(cellInfo?.resolvedValue ?? "");
        }
      }
      return values;
    }

    const { colIndex, rowIndex } =
      ExpressionHandler.parseSymbolToPosition(symbol);

    const cellInfo = this.sheet.getCellInfoAt(colIndex, rowIndex);
    if (cellInfo && cellInfo.state != CellState.OK)
      throw new Error("Invalid cell reference: " + symbol);

    this.cellRefHolder.push({ columnIndex: colIndex, rowIndex: rowIndex });
    return cellInfo?.resolvedValue ?? "";
  }

  private static parseSymbolToPosition(symbol: string): {
    colIndex: number;
    rowIndex: number;
  } {
    const letterGroups = symbol.split(/[0-9]+/).filter((s) => s !== "");
    if (letterGroups.length != 1) throw new Error("Invalid symbol: " + symbol);

    const columnStr = letterGroups[0];
    const colIndex = ExpressionHandler.resolveColumnIndex(columnStr);
    if (colIndex == -1) throw new Error("Invalid symbol: " + symbol);

    const rowStr = symbol.substring(columnStr.length);
    const rowIndex = parseInt(rowStr) - 1;

    if (isNaN(rowIndex)) throw new Error("Invalid symbol: " + symbol);

    return { colIndex, rowIndex };
  }

  // TODO Translating between column names and indices should probably be a common function.
  private static resolveColumnIndex(column: string): number {
    let index = 0;
    for (let i = 0; i < column.length; i++) {
      if (column[i] < "A" || column[i] > "Z") return -1;
      let baseIndex = column.charCodeAt(i) - "A".charCodeAt(0);
      if (i != column.length - 1) baseIndex += 1;
      // Character index gives us the exponent: for example, 'AAB' is 26^2 * 1 + 26^1 * 1 + 26^0 * 1 + 1
      const exp = column.length - i - 1;
      index += baseIndex * Math.pow(26, exp);
    }

    return index;
  }
}
