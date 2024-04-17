import { ColumnKey, RowKey } from "./key/keyTypes.ts";
import { CellState } from "./cell/cellState.ts";

export type PositionInfo = {
  columnKey?: ColumnKey;
  rowKey?: RowKey;
};

export type CellInfo = {
  position: PositionInfo;
  rawValue?: string;
  resolvedValue?: string;
  formattedValue?: string;
  state?: CellState;
};

export enum ShiftDirection {
  forward = "forward",
  backward = "backward",
}

export type StyleInfo = { css?: string, format?: { type: string, options?: any } }