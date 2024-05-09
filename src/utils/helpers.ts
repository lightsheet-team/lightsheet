import { IndexPosition } from "./common.types";

export function GenerateRowLabel(rowIndex: number): string {
  let label = "";
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  while (rowIndex > 0) {
    rowIndex--; // Adjust index to start from 0
    label = alphabet[rowIndex % 26] + label;
    rowIndex = Math.floor(rowIndex / 26);
  }
  return label || "A"; // Return "A" if index is 0
}

export function GetRowColFromCellRef(cellRef: string): IndexPosition {
  // Regular expression to extract the column and row indexes
  const matches = cellRef.match(/^([A-Z]+)?(\d+)?$/);
  if (matches) {
    const colStr = matches[1] || ""; // If column letter is not provided, default to empty string
    const rowStr = matches[2] || ""; // If row number is not provided, default to empty string

    // Convert column string to index
    let colIndex = 0;
    if (colStr !== "") {
      for (let i = 0; i < colStr.length; i++) {
        colIndex = colIndex * 26 + (colStr.charCodeAt(i) - 64);
      }
    }

    // Convert row string to index
    const rowIndex = rowStr ? parseInt(rowStr, 10) : null;

    return {
      rowIndex: rowIndex ? rowIndex - 1 : null,
      columnIndex: colIndex ? colIndex - 1 : null,
    };
  } else {
    // Invalid cell reference
    return { rowIndex: null, columnIndex: null };
  }
}

export function GenerateColumnLabel(rowIndex: number) {
  let label = "";
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  while (rowIndex > 0) {
    rowIndex--; // Adjust index to start from 0
    label = alphabet[rowIndex % 26] + label;
    rowIndex = Math.floor(rowIndex / 26);
  }
  return label || "A"; // Return "A" if index is 0
}

export function GenerateStyleMapFromString(style: string): Map<string, string> {
  const mappedStyle = new Map<string, string>();
  style.split(";").forEach((item: string) => {
    const [key, value] = item.split(":");
    if (!key || !value) return;
    mappedStyle.set(key.trim(), value.trim());
  });
  return mappedStyle;
}

export function GenerateStyleStringFromMap(style: Map<string, string>) {
  let result = "";
  for (const [key, value] of style) {
    result += `${key}:${value};`;
  }
  return result;
}
