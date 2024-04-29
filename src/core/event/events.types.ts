import { IndexPosition } from "../../utils/common.types.ts";
import { KeyPosition } from "../structure/sheet.types.ts";

export type UISetCellPayload = {
  keyPosition?: KeyPosition;
  indexPosition?: IndexPosition;
  rawValue: string;
};

export type CoreSetCellPayload = {
  keyPosition?: KeyPosition;
  indexPosition: IndexPosition;
  rawValue: string;
  formattedValue: string;

  clearCell?: boolean;
  clearRow?: boolean;
};

export type CoreSetStylePayload = {
  indexPosition: IndexPosition;
  value: string;
};

export enum EventType {
  VIEW_SET_CELL = 0,
  CORE_SET_CELL = 1,
  VIEW_SET_STYLE = 2,
}