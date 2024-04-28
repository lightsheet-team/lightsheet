export default class LightSheetHelper {
  static generateColumnLabel = (rowIndex: number) => {
    let label = "";
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    while (rowIndex > 0) {
      rowIndex--; // Adjust index to start from 0
      label = alphabet[rowIndex % 26] + label;
      rowIndex = Math.floor(rowIndex / 26);
    }
    return label || "A"; // Return "A" if index is 0
  };

  static parseSymbolToPosition(
    symbol: string,
    allowSingle: boolean = false,
  ): {
    colIndex: number;
    rowIndex: number;
  } {
    const letterGroups = symbol.split(/[0-9]+/).filter((s) => s !== "");
    if (letterGroups.length != 1) {
      if (allowSingle) {
        // Try to parse as a single row index.
        const rowIndex = parseInt(symbol) - 1;
        if (!isNaN(rowIndex)) return { colIndex: -1, rowIndex };
      }
      throw new Error("Invalid symbol: " + symbol);
    }

    const columnStr = letterGroups[0];
    const colIndex = LightSheetHelper.resolveColumnIndex(columnStr);
    if (colIndex == -1) {
      throw new Error("Invalid symbol: " + symbol);
    }

    const rowStr = symbol.substring(columnStr.length);
    const rowIndex = parseInt(rowStr) - 1;

    if (isNaN(rowIndex)) {
      if (allowSingle) return { colIndex, rowIndex: -1 };
      throw new Error("Invalid symbol: " + symbol);
    }

    return { colIndex, rowIndex };
  }

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
