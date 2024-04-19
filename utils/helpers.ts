import { CoreSetCellPayload } from "../src/core/event/events.types";
import { ElementInfo } from "../src/core/structure/sheet.types";

export default class LightSheetHelper {
  static GenerateRowLabel = (rowIndex: number) => {
    let label = "";
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    while (rowIndex > 0) {
      rowIndex--; // Adjust index to start from 0
      label = alphabet[rowIndex % 26] + label;
      rowIndex = Math.floor(rowIndex / 26);
    }
    return label || "A"; // Return "A" if index is 0
  };

  static GetElementInfo = (elementInfo: ElementInfo) => {
    const { keyInfo, indexInfo } = elementInfo;
    const colKey = keyInfo?.columnKey?.toString();
    const rowKey = keyInfo?.rowKey?.toString();

    const columnIndex = indexInfo?.columnIndex;
    const rowIndex = indexInfo?.rowIndex;

    const cellDomKey =
      colKey && rowKey ? `${colKey!.toString()}_${rowKey!.toString()}` : null;
    const cellDom =
      (cellDomKey && document.getElementById(cellDomKey)) ||
      document.getElementById(`${columnIndex}_${rowIndex}`);

    return cellDom;
  };

  static GetElementInfoForSetCell = (payload: CoreSetCellPayload) => {
    const colKey = payload.position.columnKey?.toString();
    const rowKey = payload.position.rowKey?.toString();

    const columnIndex = payload.indexPosition.columnIndex;
    const rowIndex = payload.indexPosition.rowIndex;

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

  static GenerateStyleMapFromString(style: string): Map<string, string> {
    const mappedStyle = new Map<string, string>();
    style.split(";").forEach((item: string) => {
      const [key, value] = item.split(":");
      if (!key || !value) return;
      mappedStyle.set(key.trim(), value.trim());
    });
    return mappedStyle;
  }

  static GenerateStyleStringFromMap(style: Map<string, string>) {
    let result = "";
    for (const [key, value] of style) {
      result += `${key}:${value};`;
    }
    return result;
  }
}
