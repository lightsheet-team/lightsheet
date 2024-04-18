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

import LightSheetHelper from "../../utils/helpers.ts";
import Sheet from "../structure/sheet.ts";
import {
  CellSheetPosition,
  EvaluationResult,
} from "./expressionHandler.types.ts";

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
  private sheet: Sheet;

  private cellRefHolder: Array<CellSheetPosition>;
  private rawValue: string;

  constructor(targetSheet: Sheet, rawValue: string) {
    this.sheet = targetSheet;

    this.rawValue = rawValue;
    this.cellRefHolder = [];

    math.FunctionNode.onUndefinedFunction = (name: string) =>
      this.resolveFunction(name);

    //Configure mathjs to allow colons in symbols.
    const isAlphaOriginal = math.parse.isAlpha;
    math.parse.isAlpha = (c: string, cPrev: string, cNext: string): boolean => {
      return isAlphaOriginal(c, cPrev, cNext) || c == ":" || c == "!";
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
    let targetSheet = this.sheet;
    if (symbol.includes("!")) {
      const parts = symbol.split("!").filter((s) => s !== "");
      if (parts.length != 2)
        throw new Error("Invalid sheet reference: " + symbol);

      const sheetName = parts[0];
      const refSheet = this.sheet.sheetHolder.getSheetByName(sheetName);
      if (!refSheet) throw new Error("Invalid sheet reference: " + symbol);
      targetSheet = refSheet;
      symbol = parts[1];
    }

    // TODO only handling references within one sheet for now.
    if (symbol.includes(":")) {
      const rangeParts = symbol.split(":").filter((s) => s !== "");
      if (rangeParts.length != 2) throw new Error("Invalid range: " + symbol);

      const start = ExpressionHandler.parseSymbolToPosition(rangeParts[0]);
      const end = ExpressionHandler.parseSymbolToPosition(rangeParts[1]);

      const values: string[] = [];
      for (let i = start.rowIndex; i <= end.rowIndex; i++) {
        for (let j = start.colIndex; j <= end.colIndex; j++) {
          const cellInfo = targetSheet.getCellInfoAt(j, i);
          if (cellInfo && cellInfo.state != CellState.OK)
            throw new Error("Invalid cell reference: " + symbol);

          this.cellRefHolder.push({
            sheetKey: targetSheet.key,
            position: { column: j, row: i },
          });
          values.push(cellInfo?.resolvedValue ?? "");
        }
      }
      return values;
    }

    const { colIndex, rowIndex } =
      ExpressionHandler.parseSymbolToPosition(symbol);

    const cellInfo = targetSheet.getCellInfoAt(colIndex, rowIndex);
    if (cellInfo && cellInfo.state != CellState.OK)
      throw new Error("Invalid cell reference: " + symbol);

    this.cellRefHolder.push({
      sheetKey: targetSheet.key,
      position: {
        column: colIndex,
        row: rowIndex,
      },
    });
    return cellInfo?.resolvedValue ?? "";
  }

  private static parseSymbolToPosition(symbol: string): {
    colIndex: number;
    rowIndex: number;
  } {
    const letterGroups = symbol.split(/[0-9]+/).filter((s) => s !== "");
    if (letterGroups.length != 1) throw new Error("Invalid symbol: " + symbol);

    const columnStr = letterGroups[0];
    const colIndex = LightSheetHelper.resolveColumnIndex(columnStr);
    if (colIndex == -1) throw new Error("Invalid symbol: " + symbol);

    const rowStr = symbol.substring(columnStr.length);
    const rowIndex = parseInt(rowStr) - 1;

    if (isNaN(rowIndex)) throw new Error("Invalid symbol: " + symbol);

    return { colIndex, rowIndex };
  }
}
