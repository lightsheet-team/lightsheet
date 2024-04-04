import {
  create,
  parseDependencies,
  addDependencies,
  subtractDependencies,
  multiplyDependencies,
  divideDependencies,
  SymbolNodeDependencies,
  FunctionNodeDependencies,
} from "mathjs/number";

import Sheet from "../structure/sheet.ts";
import { PositionInfo } from "../structure/sheet.types.ts";
import { EvaluationResult } from "./expressionHandler.types.ts";

import { CellState } from "../structure/cell/cellState.ts";
const math = create({
  parseDependencies,
  addDependencies,
  subtractDependencies,
  multiplyDependencies,
  divideDependencies,
  SymbolNodeDependencies,
  FunctionNodeDependencies,
});

export default class ExpressionHandler {
  sheet: Sheet;

  private cellRefCache: Array<PositionInfo>;

  constructor(sheet: Sheet) {
    this.sheet = sheet; // TODO The scope of this class should be all sheets, not just one.

    // When resolving a formula, this array is populated with a single cell's outgoing reference positions and cleared after.
    // This allows ExpressionHandler::resolveSymbol to essentially pass values to ExpressionHandler::evaluate.
    this.cellRefCache = [];

    // Add our symbol resolving methods to mathjs.
    math.FunctionNode.onUndefinedFunction = (name: string) =>
      this.resolveFunction(name);

    math.SymbolNode.onUndefinedSymbol = (name: string) =>
      this.resolveSymbol(name);
  }

  evaluate(expression: string): EvaluationResult | null {
    if (!expression.startsWith("="))
      return { value: expression, references: [] };

    expression = expression.substring(1);
    try {
      const parsed = math.parse(expression);
      const value = parsed.evaluate();
      const references = this.cellRefCache.slice();
      this.cellRefCache = [];
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

  private resolveSymbol(name: string): string {
    // Symbols should always be cell references in our case.
    // TODO only handling references within one sheet for now.
    const split = name.split(/[0-9]+/);
    if (split.length != 2) throw new Error("Invalid symbol: " + name);

    // Resolve column/row indices from text-based cell reference.
    const columnStr = split[0];
    const rowStr = name.substring(columnStr.length);
    const columnIndex = ExpressionHandler.resolveColumnIndex(columnStr);
    if (columnIndex == -1) throw new Error("Invalid symbol: " + name);
    const rowIndex = parseInt(rowStr) - 1;

    let cellInfo = this.sheet.getCellInfoAt(columnIndex, rowIndex);
    if (!cellInfo) {
      // Referring to a non-existent cell. Initialize it with an empty value.
      cellInfo = this.sheet.setCellAt(columnIndex, rowIndex, "", true);
    }

    if (cellInfo.state != CellState.OK)
      throw new Error("Invalid cell reference: " + name);

    this.cellRefCache.push(cellInfo.position);
    return cellInfo.value!;
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
