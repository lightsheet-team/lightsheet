import { PositionInfo } from "../structure/sheet.types.ts";

enum EventType {
  UI_SET_CELL = 0,
  CORE_SET_CELL = 1,
}

export default EventType;

export type IndexPosition = {
  columnIndex: number;
  rowIndex: number;
};

export type UISetCellPayload = {
  keyPosition?: PositionInfo;
  indexPosition?: IndexPosition;
  formula: string;
};

export type CoreSetCellPayload = {
  position: PositionInfo;
  indexPosition: IndexPosition;
  formula: string;
  value: string;

  clearCell: boolean;
  clearRow: boolean;
};
