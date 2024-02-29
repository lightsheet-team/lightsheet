import CellGroup from "./cellGroup.ts";
import CellStyle from "./cellStyle";
import { CellKey }from "./keyTypes";
import { ColumnKey } from "./keyTypes";
import { RowKey } from "./keyTypes";

export default class Column extends CellGroup<ColumnKey> {
    cellIndex: Map<RowKey, CellKey>;
    cellFormatting: Map<RowKey, CellStyle>;

    constructor(width: number, position: number) {
        super(width, position);
        this.key = new ColumnKey();
        this.cellIndex = new Map<RowKey, CellKey>();
        this.cellFormatting = new Map<RowKey, CellStyle>();
    }

    getWidth(): number {
        return this.size_;
    }
}