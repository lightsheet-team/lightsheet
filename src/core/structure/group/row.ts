import CellGroup from "./cellGroup.ts";
import { CellKey, ColumnKey, generateRowKey, RowKey } from "../key/keyTypes.ts";
import CellStyle from "../cellStyle.ts";

export default class Row extends CellGroup<RowKey> {
  cellIndex: Map<ColumnKey, CellKey>;
  cellFormatting: Map<ColumnKey, CellStyle>;

  constructor(width: number, position: number) {
    super(width, position);
    this.key = generateRowKey();
    this.cellIndex = new Map<ColumnKey, CellKey>();
    this.cellFormatting = new Map<ColumnKey, CellStyle>();
  }

  getHeight(): number {
    return this.size_;
  }
}
