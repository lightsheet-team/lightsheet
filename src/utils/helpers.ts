export default class LightsheetHelper {
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
  static getChildIndex = (node: HTMLElement) => {
    return Array.prototype.indexOf.call(node.parentNode?.childNodes, node);
  };
  static getCellIndexFromTd = (cell: HTMLElement) => {
    // minus 1 to adjust for the header row
    const columnIndex = LightSheetHelper.getChildIndex(cell) - 1;
    const rowIndex = LightSheetHelper.getChildIndex(cell.parentElement!);
    return {
      columnIndex,
      rowIndex,
    };
  };
}
