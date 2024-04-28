import { PositionInfo } from "../structure/sheet.types.ts";
import { Coordinate } from "../../utils/common.types.ts";

export type UISetCellPayload = {
  keyPosition?: PositionInfo;
  indexPosition?: Coordinate;
  rawValue: string;
};

export type CoreSetCellPayload = {
  keyPosition: PositionInfo;
  indexPosition: Coordinate;
  rawValue: string;
  formattedValue: string;

  clearCell: boolean;
  clearRow: boolean;
};

export type CoreSetStylePayload = {
  columnIndex: number | undefined;
  rowIndex: number | undefined;
  keyPosition: PositionInfo;
  styleMap: Map<string, string>;
  append: boolean;
};
