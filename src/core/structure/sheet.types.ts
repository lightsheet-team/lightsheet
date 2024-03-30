import { CellKey, ColumnKey, RowKey } from "./key/keyTypes.ts";

import { CellState } from "./cell/cellState.ts";

export type PositionInfo = {
  columnKey?: ColumnKey;
  rowKey?: RowKey;
};

export type CellInfo = {
  position: PositionInfo;
  value?: string;
  state?: CellState;
};

export type ResolveCellResult = {
  valueChanged: boolean;
  dirtyCells?: Map<CellKey, PositionInfo>;
};

export enum ShiftDirection {
  forward = "forward",
  backward = "backward",
}
