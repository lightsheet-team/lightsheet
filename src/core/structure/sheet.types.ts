import { ColumnKey, RowKey } from "./key/keyTypes.ts";
import { CellState } from "./cell/cellState.ts";
import { IndexPosition } from "../../utils/common.types.ts";

export type KeyPosition = {
  columnKey?: ColumnKey;
  rowKey?: RowKey;
};

export type CellInfo = {
  position: KeyPosition;
  rawValue?: string;
  resolvedValue?: string;
  formattedValue?: string;
  state?: CellState;
};

export enum GroupTypes {
  Column = 1,
  Row,
}
export type GroupType = GroupTypes;

export type ElementInfo = {
  keyPosition?: KeyPosition;
  indexPosition?: IndexPosition;
};

export enum ShiftDirection {
  forward = "forward",
  backward = "backward",
}

export type Format = { type: string; options?: any };

export type StyleInfo = {
  position: string;
  css?: string;
  format?: Format;
};
