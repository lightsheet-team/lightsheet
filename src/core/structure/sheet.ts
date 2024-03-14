import { CellKey, ColumnKey, RowKey } from "./key/keyTypes.ts";
import Cell from "./cell/cell.ts";
import Column from "./group/column.ts";
import Row from "./group/row.ts";
import { PositionInfo } from "./sheet.types.ts";
import CellStyle from "./cellStyle.ts";
import CellGroup from "./group/cellGroup.ts";

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
    this.defaultStyle = new CellStyle(
      null,
      30,
      10,
      [0, 0, 0],
      [false, false, false, false],
    ); // TODO This should be configurable.

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
    return this.setCell(position.columnKey!, position.rowKey!, value);
  }

  setCell(colKey: ColumnKey, rowKey: RowKey, value: string): PositionInfo {
    let cell = this.getCell(colKey, rowKey);
    if (!cell) {
      cell = this.createCell(colKey, rowKey, value);
    } else if (value == "") {
      // Cell exists but is being cleared.
      this.deleteCell(colKey, rowKey);
    }

    if (cell) {
      cell.formula = value;
      this.resolveCell(cell);
    }

    return {
      rowKey: this.rows.has(rowKey) ? rowKey : undefined,
      columnKey: this.columns.has(colKey) ? colKey : undefined,
    };
  }

  deleteCell(colKey: ColumnKey, rowKey: RowKey): boolean {
    const col = this.columns.get(colKey);
    const row = this.rows.get(rowKey);
    if (!col || !row) return false;

    if (!col.cellIndex.has(row.key)) return false;
    const cellKey = col.cellIndex.get(row.key)!;

    // Delete cell data and all references to it in its column and row.
    this.cell_data.delete(cellKey);

    col.cellIndex.delete(row.key);
    col.cellFormatting.delete(row.key);
    row.cellIndex.delete(col.key);
    row.cellFormatting.delete(col.key);

    // Clean up empty rows and columns unless they're the first ones.
    if (col.cellIndex.size == 0 && col.position != 0) {
      this.columns.delete(colKey);
      this.columnPositions.delete(col.position);
    }

    if (row.cellIndex.size == 0 && row.position != 0) {
      this.rows.delete(rowKey);
      this.rowPositions.delete(row.position);
    }

    // TODO References should also be checked here.

    return true;
  }

  getCellStyle(colKey: ColumnKey, rowKey: RowKey): CellStyle {
    const col = this.columns.get(colKey);
    const row = this.rows.get(rowKey);
    if (!col || !row) return this.defaultStyle;

    const existingStyle = col.cellFormatting.get(row.key);
    const cellStyle = new CellStyle().clone(existingStyle);

    // Apply style properties with priority: cell style > column style > row style > default style.
    cellStyle
      .applyStylesOf(col.defaultStyle)
      .applyStylesOf(row.defaultStyle)
      .applyStylesOf(this.defaultStyle);

    return cellStyle;
  }

  setCellStyle(
    colKey: ColumnKey,
    rowKey: RowKey,
    style: CellStyle | null,
  ): boolean {
    const col = this.columns.get(colKey);
    const row = this.rows.get(rowKey);
    if (!col || !row) return false;

    if (style == null) {
      return this.clearCellStyle(colKey, rowKey);
    }
    style = new CellStyle().clone(style);

    col.cellFormatting.set(row.key, style);
    row.cellFormatting.set(col.key, style);
    return true;
  }

  setColumnStyle(colKey: ColumnKey, style: CellStyle | null): boolean {
    const col = this.columns.get(colKey);
    if (!col) return false;

    this.setCellGroupStyle(col, style);
    return true;
  }

  setRowStyle(rowKey: RowKey, style: CellStyle | null): boolean {
    const row = this.rows.get(rowKey);
    if (!row) return false;

    this.setCellGroupStyle(row, style);
    return true;
  }

  private setCellGroupStyle(
    group: CellGroup<ColumnKey | RowKey>,
    style: CellStyle | null,
  ) {
    style = style ? new CellStyle().clone(style) : null;
    group.defaultStyle = style;

    // Iterate through cells in this column and clear any styling properties set by the new style.
    for (const [opposingKey, cellStyle] of group.cellFormatting) {
      const shouldClear = cellStyle.clearStylingSetBy(style);
      if (!shouldClear) continue;

      // The cell's style will have no properties after applying this group's new style; clear it.
      if (group instanceof Column) {
        this.clearCellStyle(group.key, opposingKey as RowKey);
        continue;
      }
      this.clearCellStyle(opposingKey as ColumnKey, group.key as RowKey);
    }
  }

  private clearCellStyle(colKey: ColumnKey, rowKey: RowKey): boolean {
    const col = this.columns.get(colKey);
    const row = this.rows.get(rowKey);
    if (!col || !row) return false;

    col.cellFormatting.delete(row.key);
    row.cellFormatting.delete(col.key);

    return true;
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

  private createCell(colKey: ColumnKey, rowKey: RowKey, value: string): Cell {
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

  private getCell(colKey: ColumnKey, rowKey: RowKey): Cell | null {
    const col = this.columns.get(colKey);
    const row = this.rows.get(rowKey);

    if (!col || !row) return null;

    if (!col.cellIndex.has(row.key)) return null;
    const cellKey = col.cellIndex.get(row.key)!;
    return this.cell_data.get(cellKey)!;
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
