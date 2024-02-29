import CellStyle from "./cellStyle";
import { CellKey } from "./keyTypes";
import { ColumnKey } from "./keyTypes";
import { RowKey } from "./keyTypes";

export default abstract class CellGroup<TKey extends ColumnKey | RowKey> {
  key!: TKey;
  size_: number;
  position: number;
  defaultStyle: CellStyle | null;
  cellIndex: Map<ColumnKey | RowKey, CellKey>;
  cellFormatting: Map<ColumnKey | RowKey, CellStyle>;

  constructor(size: number, position: number) {
    this.size_ = size;
    this.position = position;
    this.defaultStyle = null;
    this.cellIndex = new Map<ColumnKey | RowKey, CellKey>();
    this.cellFormatting = new Map<ColumnKey | RowKey, CellStyle>();
  }
}
