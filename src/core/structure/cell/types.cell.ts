import { ColumnKey, RowKey, SheetKey } from "../key/keyTypes.ts";

export type CellReference = {
  sheetKey: SheetKey;
  column: ColumnKey;
  row: RowKey;
};
