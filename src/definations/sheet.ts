import {CellKey, ColumnKey, RowKey} from "./keyTypes.ts";
import Cell from "./cell.ts";
import Column from "./column.ts";
import Row from "./row.ts";

export default class Sheet {
    defaultStyle: any
    settings: any;
    cell_data: any;
    rows: any;
    columns: any;
    rowPositions: any
    columnPositions: any

    constructor() {
        this.defaultStyle = null;
        this.settings = null;
        this.cell_data = new Map<CellKey, Cell>();
        this.rows = new Map<RowKey, Row>();
        this.columns = new Map<ColumnKey, Column>();

        this.rowPositions = new Map<number, RowKey>();
        this.columnPositions = new Map<number, ColumnKey>();
    }

    // @ts-ignore
    setCellAt(rowPos: number, colPos: number, value: string): [RowKey, ColumnKey, CellKey] {
        return [new RowKey(), new ColumnKey(), new CellKey()]
    }

    // @ts-ignore
    setCell(row: RowKey, column: ColumnKey, value: string): CellKey {
        return new CellKey()
    }

}