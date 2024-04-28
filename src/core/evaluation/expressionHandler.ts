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
  MathNode,
} from "mathjs/number";

import Sheet from "../structure/sheet.ts";
import {
  CellSheetPosition,
  EvaluationResult,
} from "./expressionHandler.types.ts";

import { CellState } from "../structure/cell/cellState.ts";
import LightsheetHelper from "../../utils/helpers.ts";
import { Coordinate } from "../../utils/common.types.ts";
import { CellReference } from "../structure/cell/types.cell.ts";

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
  private static functions: Map<
    string,
    (cellRef: CellReference, ...args: any[]) => string
  > = new Map();

  private sheet: Sheet;

  private cellRefHolder: Array<CellSheetPosition>;
  private rawValue: string;
  private targetCellRef: CellReference;

  constructor(targetSheet: Sheet, targetCell: CellReference, rawValue: string) {
    this.sheet = targetSheet;
    this.targetCellRef = targetCell;

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
      parsed.transform((node) =>
        this.injectFunctionParameter(node, this.targetCellRef),
      );

      const value = parsed.evaluate().toString();
      const references = this.cellRefHolder.slice();
      this.cellRefHolder = [];
      return { value: value, references: references };
    } catch (e) {
      return null;
    }
  }

  updatePositionalReferences(from: Coordinate, to: Coordinate) {
    if (!this.rawValue.startsWith("=")) return this.rawValue;

    const expression = this.rawValue.substring(1);
    const parseResult = math.parse(expression);

    const fromSymbol =
      LightsheetHelper.generateColumnLabel(from.column + 1) + (from.row + 1);
    const toSymbol =
      LightsheetHelper.generateColumnLabel(to.column + 1) + (to.row + 1);

    // Update each symbol in the expression.
    const transform = parseResult.transform((node) =>
      this.updateReferenceSymbol(node, fromSymbol, toSymbol),
    );
    return `=${transform.toString()}`;
  }

  private injectFunctionParameter(node: MathNode, cellPos: CellReference) {
    if (node instanceof math.FunctionNode) {
      const fName = (node as math.FunctionNode).fn.name;
      // If the node is a custom function, inject the cell position as the first argument.
      // This allows custom functions to access the cell invoking the function.
      if (ExpressionHandler.functions.has(fName)) {
        // Copy CellReference into mathjs node structure.
        const record: Record<string, any> = {};
        for (const key in cellPos) {
          record[key] = new math.ConstantNode(
            cellPos[key as keyof CellReference],
          );
        }
        node.args.unshift(new math.ObjectNode(record));
      }
    }
    return node;
  }

  private updateReferenceSymbol(
    node: MathNode,
    targetSymbol: string,
    newSymbol: string,
  ) {
    if (!(node instanceof math.SymbolNode)) {
      return node;
    }
    const symbolNode = node as math.SymbolNode;

    let prefix = "";
    let symbol = symbolNode.name;
    if (symbol.includes("!")) {
      const parts = symbol.split("!");
      prefix = parts[0] + "!";
      symbol = parts[1];
    }

    if (symbol.includes(":")) {
      const parts = symbol.split(":");
      if (parts.length != 2) {
        return symbolNode;
      }
      const newStart = parts[0] === targetSymbol ? newSymbol : parts[0];
      const newEnd = parts[1] === targetSymbol ? newSymbol : parts[1];
      symbolNode.name = prefix + newStart + ":" + newEnd;
      return symbolNode;
    }

    if (symbol !== targetSymbol) {
      return symbolNode;
    }

    symbolNode.name = prefix + newSymbol;
    return symbolNode;
  }

  private resolveFunction(
    name: string,
  ): (cellRef: CellReference, ...args: any[]) => string {
    const fun = ExpressionHandler.functions.get(name.toLowerCase());
    if (!fun) {
      console.log(
        `Undefined function "${name}" in expression "${this.rawValue}"`,
      );
      return () => "";
    }

    return fun;
  }

  static registerFunction(
    name: string,
    fun: (cellRef: CellReference, ...args: any[]) => string,
  ) {
    ExpressionHandler.functions.set(name.toLowerCase(), fun);
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
