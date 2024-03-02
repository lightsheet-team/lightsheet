import { CellKey, ColumnKey, RowKey } from "./keyTypes.ts";
import Cell from "./cell.ts";
import Column from "./column.ts";
import Row from "./row.ts";
import { PositionInfo } from "./sheet.types.ts";

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

  setCellAt(colPos: number, rowPos: number, value: string): PositionInfo {
    const position = this.initializePosition(colPos, rowPos);
    return this.setCell(position.columnKey, position.rowKey, value);
  }

  setCell(colKey: ColumnKey, rowKey: RowKey, value: string): PositionInfo {
    if (!this.getCell(colKey, rowKey)) {
      this.createCell(colKey, rowKey, value);
    }

    return { rowKey: rowKey, columnKey: colKey };
  }

  createCellAt(colPos: number, rowPos: number, value: string): Cell {
    const position = this.initializePosition(colPos, rowPos);
    return this.createCell(position.columnKey, position.rowKey, value);
  }

  createCell(colKey: ColumnKey, rowKey: RowKey, value: string): Cell {
    const col = this.columns.get(colKey);
    const row = this.rows.get(rowKey);
    if (!col || !row) {
      throw new Error(
        `Failed to create cell at col: ${col} row: ${row}: Column or Row not found.`,
      );
    }

    if (col.cellIndex.has(row.key)) {
      throw new Error(
        `Failed to create cell at col: ${col} row: ${row}: Cell already exists.`,
      );
    }

    const cell = new Cell();
    cell.formula = value;
    this.cell_data.set(cell.key, cell);
    this.resolveCell(cell);

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
    const cellKey = col.cellIndex.get(row.key)!;
    return this.cell_data.get(cellKey)!;
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

  // <Row index, <Column index, value>>
  exportData(): Map<number, Map<number, string>> {
    const data = new Map<number, Map<number, string>>();

    for (const [rowPos, rowKey] of this.rowPositions) {
      const rowData = new Map<number, string>();
      const row = this.rows.get(rowKey)!;

      // Use row's cell index to get keys for each cell and their corresponding columns.
      for (const [colKey, cellKey] of row.cellIndex) {
        const cell = this.cell_data.get(cellKey)!;
        const column = this.columns.get(colKey)!;
        rowData.set(column.position, cell.value);
      }

      data.set(rowPos, rowData);
    }

    return data;
  }

  private resolveCell(cell: Cell) {
    cell.value = cell.formula; // TODO
  }

  private initializePosition(colPos: number, rowPos: number): PositionInfo {
    let rowKey;
    let colKey;

    // Create row and column if they don't exist yet.
    if (!this.rowPositions.has(rowPos)) {
      const row = new Row(this.default_height, rowPos);
      this.rows.set(row.key, row);
      this.rowPositions.set(rowPos, row.key);

      rowKey = row.key;
    } else {
      rowKey = this.rowPositions.get(rowPos)!;
    }

    if (!this.columnPositions.has(colPos)) {
      // Create a new column
      const col = new Column(this.default_width, colPos);
      this.columns.set(col.key, col);
      this.columnPositions.set(colPos, col.key);

      colKey = col.key;
    } else {
      colKey = this.columnPositions.get(colPos)!;
    }

    return { rowKey: rowKey, columnKey: colKey };
  }
}
