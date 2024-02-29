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
    setCellAt(rowPos: number, colPos: number, value: string): {rowKey: RowKey, columnKey: ColumnKey, cellKey: CellKey} {
        if(!this.rowPositions.has(rowPos) || !this.columnPositions.has(colPos)){
            this.initializePosition(rowPos, colPos)
        }

        return {rowKey: new RowKey(), columnKey: new ColumnKey(), cellKey: new CellKey()}
    }

    getCellAt(rowPos: number, colPos: number): Cell | null {
        const col = this.getColumnAt(colPos);
        const row = this.getRowAt(rowPos);

        if(!col || !row) return null
    }

    getColumnAt(colPos: number): Column | null {
        if(!this.columnPositions.has(colPos)) {
            return null;
        }

        return this.columns[this.columnPositions[colPos]]
    }

    getRowAt(rowPos: number): Row | null {
        if(!this.rowPositions.has(rowPos)) {
            return null;
        }

        return this.rows[this.rowPositions[rowPos]]
    }

    // @ts-ignore
    setCell(row: RowKey, column: ColumnKey, value: string): CellKey {
        return new CellKey()
    }

    private initializePosition(rowPos: number, colPos: number) {
        if(!this.rowPositions.has(rowPos)){
            // Create a new row
            const row = new Row();
            // this.rows.set(row.key, row);
            //this.rowPositions.set(rowPos, row.key);
        }

        if(!this.columnPositions.has(colPos)){
            // Create a new row
            const col = new Column();
            // this.rows.set(row.key, row);
            //this.rowPositions.set(rowPos, row.key);
        }


    }
}