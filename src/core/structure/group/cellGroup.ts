import { CellKey, ColumnKey, RowKey } from "../key/keyTypes.ts";
import CellStyle from "../cellStyle.ts";

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
