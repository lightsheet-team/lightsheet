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

export type ElementInfo = {
  keyInfo?: KeyInfo;
  indexInfo?: IndexInfo
}

export enum ShiftDirection {
  forward = "forward",
  backward = "backward",
}

export type StyleInfo = { position: string, css?: string, format?: { type: string, options?: any } }