import { CellKey, ColumnKey, RowKey } from "./keyTypes.ts";
import Cell from "./cell.ts";
import Column from "./column.ts";
import Row from "./row.ts";

export default class Sheet {
  defaultStyle: any;
  settings: any;
  cell_data: Map<CellKey, Cell>;
  rows: Map<RowKey, Row>;
  columns: Map<ColumnKey, Column>;
  rowPositions: Map<number, RowKey>;
  columnPositions: Map<number, ColumnKey>;

  default_width: number;
  default_height: number;

  constructor() {
    this.defaultStyle = null;
    this.settings = null;
    this.cell_data = new Map<CellKey, Cell>();
    this.rows = new Map<RowKey, Row>();
    this.columns = new Map<ColumnKey, Column>();

    this.rowPositions = new Map<number, RowKey>();
    this.columnPositions = new Map<number, ColumnKey>();

    this.default_width = 40;
    this.default_height = 20;
  }

  setCellAt(
    colKey: number,
    rowKey: number,
    value: string,
  ): { rowKey: RowKey; columnKey: ColumnKey; cellKey: CellKey } {
    const position = this.initializePosition(colKey, rowKey);
    const row = this.rows.get(position.rowKey);
    const column = this.columns.get(position.columnKey);

    if (!row || !column)
      throw new Error(`Failed to set cell at col: ${column} row: ${row}.`);

    return this.setCell(column, row, value);
  }

  setCell(
    column: Column,
    row: Row,
    value: string,
  ): { rowKey: RowKey; columnKey: ColumnKey; cellKey: CellKey } {
    let cell = this.getCell(column.key, row.key);
    if (!cell) {
      cell = this.createCell(column, row, value);
    }

    return { rowKey: row.key, columnKey: column.key, cellKey: cell.key };
  }

  createCellAt(colPos: number, rowPos: number, value: string): Cell {
    const position = this.initializePosition(colPos, rowPos);
    const col = this.columns.get(position.columnKey);
    const row = this.rows.get(position.rowKey);

    if (!col || !row)
      throw new Error(`Failed to create cell at col: ${col} row: ${row}.`);

    return this.createCell(col, row, value);
  }

  createCell(col: Column, row: Row, value: string): Cell {
    const cell = new Cell();
    cell.formula = value;
    this.cell_data.set(cell.key, cell);

    col.cellIndex.set(row.key, cell.key);
    row.cellIndex.set(col.key, cell.key);

    return cell;
  }

  getCellAt(colPos: number, rowPos: number): Cell | null {
    const col = this.getColumnAt(colPos);
    const row = this.getRowAt(rowPos);

    if (!col || !row) return null;
    return this.getCell(col.key, row.key);
  }

  getCell(colKey: ColumnKey, rowKey: RowKey): Cell | null {
    const col = this.columns.get(colKey);
    const row = this.rows.get(rowKey);

    if (!col || !row) return null;

    if (!col.cellIndex.has(row.key)) return null;
    const cellKey = col.cellIndex.get(row.key);

    if (!cellKey) return null;
    const cell = this.cell_data.get(cellKey);
    return cell ?? null;
  }

  getColumnAt(colPos: number): Column | null {
    const colKey = this.columnPositions.get(colPos);
    if (!colKey) return null;

    return this.columns.get(colKey) ?? null;
  }

  getRowAt(rowPos: number): Row | null {
    const rowKey = this.rowPositions.get(rowPos);
    if (!rowKey) return null;

    return this.rows.get(rowKey) ?? null;
  }

  private initializePosition(
    colPos: number,
    rowPos: number,
  ): { rowKey: RowKey; columnKey: ColumnKey } {
    let rowKey;
    let colKey;

    if (!this.rowPositions.has(rowPos)) {
      // Create a new row
      const row = new Row(this.default_height, rowPos);
      this.rows.set(row.key, row);
      this.rowPositions.set(rowPos, row.key);

      rowKey = row.key;
    } else {
      rowKey = this.rowPositions.get(rowPos);
    }

    if (!this.columnPositions.has(colPos)) {
      // Create a new row
      const col = new Column(this.default_width, colPos);
      this.columns.set(col.key, col);
      this.columnPositions.set(colPos, col.key);

      colKey = col.key;
    } else {
      colKey = this.columnPositions.get(colPos);
    }

    if (!rowKey || !colKey)
      throw new Error(
        `Failed to initialize position at col: ${colKey} row: ${rowKey}.`,
      );

    return { rowKey: rowKey, columnKey: colKey };
  }
}
