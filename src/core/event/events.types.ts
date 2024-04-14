import CellStyle from "../structure/cellStyle.ts";
import { PositionInfo } from "../structure/sheet.types.ts";

export type IndexPosition = {
  columnIndex: number;
  rowIndex: number;
};

export type UISetCellPayload = {
  keyPosition?: PositionInfo;
  indexPosition?: IndexPosition;
  rawValue: string;
};

export type CoreSetCellPayload = {
  position: PositionInfo;
  indexPosition: IndexPosition;
  rawValue: string;
  formattedValue: string;

  clearCell: boolean;
  clearRow: boolean;
};

export type CoreSetStylePayload = {
  position: PositionInfo;
  value: Map<string, string>
}