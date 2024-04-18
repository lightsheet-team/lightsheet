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

export type UIMoveCellGroupPayload = {
  fromIndex: number;
  toIndex: number;
  moveType: "row" | "column";
};
