import { CoreSetCellPayload } from "../core/event/events.types.ts";

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

  static getElementInfoForSetCell = (payload: CoreSetCellPayload) => {
    const colKey = payload.keyPosition.columnKey?.toString();
    const rowKey = payload.keyPosition.rowKey?.toString();

    const columnIndex = payload.indexPosition.column;
    const rowIndex = payload.indexPosition.row;

    const cellDomKey =
      colKey && rowKey ? `${colKey!.toString()}_${rowKey!.toString()}` : null;

    // Get the cell by either column and row key or position.
    // TODO Index-based ID may not be unique if there are multiple sheets.
    const cellDom =
      (cellDomKey && document.getElementById(cellDomKey)) ||
      document.getElementById(`${columnIndex}_${rowIndex}`);

    const newCellDomId = payload.clearCell
      ? `${columnIndex}_${rowIndex}`
      : `${colKey}_${rowKey}`;

    const newRowDomId = payload.clearRow ? `row_${rowIndex}` : rowKey!;

    const rowDom =
      (rowKey && document.getElementById(rowKey)) ||
      document.getElementById(`row_${rowIndex}`);

    return {
      cellDom: cellDom,
      cellDomId: newCellDomId,
      rowDom: rowDom,
      rowDomId: newRowDomId,
    };
  };
}
