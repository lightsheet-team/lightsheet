import { FunctionNode, parse, SymbolNode } from "mathjs";
import Sheet from "../structure/sheet.ts";

export default class ExpressionHandler {
  sheet: Sheet;

  constructor(sheet: Sheet) {
    this.sheet = sheet; // TODO The scope of this class should be all sheets, not just one.

    // Add our symbol resolving methods to mathjs.
    FunctionNode.onUndefinedFunction = (name: string) =>
      this.resolveFunction(name);

    SymbolNode.onUndefinedSymbol = (name: string) => this.resolveSymbol(name);
  }

  evaluate(expression: string): string {
    if (!expression.startsWith("=")) return expression;
    expression = expression.substring(1);
    const parsed = parse(expression);
    return parsed.evaluate();
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
    if (split.length <= 1) return "";

    // Resolve column/row indices from text-based cell reference.
    const columnStr = split[0];
    const rowStr = name.substring(columnStr[0].length);
    const columnIndex = ExpressionHandler.resolveColumnIndex(columnStr);
    if (columnIndex == -1) return "";
    const rowIndex = parseInt(rowStr) - 1;

    return this.sheet.getCellValueAt(columnIndex, rowIndex);
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
