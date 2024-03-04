import CellGroup from "./cellGroup.ts";
import {
  CellKey,
  ColumnKey,
  generateColumnKey,
  RowKey,
} from "../key/keyTypes.ts";
import CellStyle from "../cellStyle.ts";

export default class Column extends CellGroup<ColumnKey> {
  cellIndex: Map<RowKey, CellKey>;
  cellFormatting: Map<RowKey, CellStyle>;

  constructor(width: number, position: number) {
    super(width, position);
    this.key = generateColumnKey();
    this.cellIndex = new Map<RowKey, CellKey>();
    this.cellFormatting = new Map<RowKey, CellStyle>();
  }

  getWidth(): number {
    return this.size_;
  }
}
