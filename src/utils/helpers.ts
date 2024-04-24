import { CoreSetCellPayload } from "../core/event/events.types";
import { ElementInfo } from "../core/structure/sheet.types";

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
