import { ColumnKey, RowKey } from "./key/keyTypes.ts";

export type PositionInfo = {
  columnKey?: ColumnKey;
  rowKey?: RowKey;
};

export type CellInfo = {
  position: PositionInfo;
  value?: string;
};
