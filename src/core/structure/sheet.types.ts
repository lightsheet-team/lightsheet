import { ColumnKey, RowKey } from "./key/keyTypes.ts";
import { CellState } from "./cell/cellState.ts";
import { IndexInfo } from "../event/events.types.ts";

export type KeyInfo = {
  columnKey?: ColumnKey;
  rowKey?: RowKey;
};

export type CellInfo = {
  position: KeyInfo;
  rawValue?: string;
  resolvedValue?: string;
  formattedValue?: string;
  state?: CellState;
};

export enum GroupTypes {
  Column = 1,
  Row,
}
export type GroupType = GroupTypes


export type ElementInfo = {
  keyInfo?: KeyInfo;
  indexInfo?: IndexInfo;
};

export enum ShiftDirection {
  forward = "forward",
  backward = "backward",
}

export type Format = { type: string; options?: any }

export type StyleInfo = {
  position: string;
  css?: string;
  format?: Format;
};

