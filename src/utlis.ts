export const generateRowLabel = (rowIndex: number): string => {
  let label = "";
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  while (rowIndex > 0) {
    rowIndex--; // Adjust index to start from 0
    label = alphabet[rowIndex % 26] + label;
    rowIndex = Math.floor(rowIndex / 26);
  }
  return label || "A"; // Return "A" if index is 0
};

export const getRowColFromCellRef = (
  cellRef: string,
): { row: number | null; col: number | null } => {
  // Regular expression to extract the column and row indexes
  const matches = cellRef.match(/^([A-Z]+)?(\d+)?$/);

  if (matches) {
    const colStr = matches[1] || ""; // If column letter is not provided, default to empty string
    const rowStr = matches[2] || ""; // If row number is not provided, default to empty string

    // Convert column string to index
    let colIndex = -1;
    if (colStr !== "") {
      for (let i = 0; i < colStr.length; i++) {
        colIndex = colIndex * 26 + (colStr.charCodeAt(i) - 64);
      }
    }

    // Convert row string to index
    const rowIndex = rowStr ? parseInt(rowStr, 10) : null;

    return { row: rowIndex, col: colIndex == -1 ? null : colIndex };
  } else {
    // Invalid cell reference
    return { row: null, col: null };
  }
};
