import { CellKey, ColumnKey, RowKey } from "./key/keyTypes.ts";
import Cell, { CellState } from "./cell/cell.ts";
import Column from "./group/column.ts";
import Row from "./group/row.ts";
import { CellInfo, PositionInfo, ShiftDirection } from "./sheet.types.ts";
import ExpressionHandler from "../evaluation/expressionHandler.ts";
import CellStyle from "./cellStyle.ts";
import CellGroup from "./group/cellGroup.ts";

export default class Sheet {
  defaultStyle: any;
  settings: any;
  cellData: Map<CellKey, Cell>;
  rows: Map<RowKey, Row>;
  columns: Map<ColumnKey, Column>;
  rowPositions: Map<number, RowKey>;
  columnPositions: Map<number, ColumnKey>;

  defaultWidth: number;
  defaultHeight: number;

  private expressionHandler: ExpressionHandler;

  constructor() {
    this.defaultStyle = new CellStyle(); // TODO This should be configurable.

    this.settings = null;
    this.cellData = new Map<CellKey, Cell>();
    this.rows = new Map<RowKey, Row>();
    this.columns = new Map<ColumnKey, Column>();

    this.rowPositions = new Map<number, RowKey>();
    this.columnPositions = new Map<number, ColumnKey>();

    this.defaultWidth = 40;
    this.defaultHeight = 20;

    this.expressionHandler = new ExpressionHandler(this);
  }

  getRowIndex(rowKey: RowKey): number | undefined {
    return this.rows.get(rowKey)?.position;
  }

  getColumnIndex(colKey: ColumnKey): number | undefined {
    return this.columns.get(colKey)?.position;
  }

  setCellAt(colPos: number, rowPos: number, value: string): CellInfo {
    const position = this.initializePosition(colPos, rowPos);
    return this.setCell(position.columnKey!, position.rowKey!, value);
  }

  setCell(colKey: ColumnKey, rowKey: RowKey, value: string): CellInfo {
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
      value: cell ? cell.value : undefined,
      position: {
        rowKey: this.rows.has(rowKey) ? rowKey : undefined,
        columnKey: this.columns.has(colKey) ? colKey : undefined,
      },
    };
  }

  public getCellValueAt(colPos: number, rowPos: number): string | null {
    const colKey = this.columnPositions.get(colPos);
    const rowKey = this.rowPositions.get(rowPos);
    if (!colKey || !rowKey) return null;

    const cell = this.getCell(colKey, rowKey);
    return cell ? cell.value : null;
  }

  moveColumn(from: number, to: number): boolean {
    return this.moveCellGroup(from, to, this.columns, this.columnPositions);
  }

  moveRow(from: number, to: number): boolean {
    return this.moveCellGroup(from, to, this.rows, this.rowPositions);
  }

  insertColumn(position: number): boolean {
    this.shiftCellGroups(
      position,
      ShiftDirection.forward,
      this.columns,
      this.columnPositions,
    );
    return true;
  }

  insertRow(position: number): boolean {
    this.shiftCellGroups(
      position,
      ShiftDirection.forward,
      this.rows,
      this.rowPositions,
    );
    return true;
  }

  deleteColumn(position: number): boolean {
    return this.deleteCellGroup(position, this.columns, this.columnPositions);
  }

  deleteRow(position: number): boolean {
    return this.deleteCellGroup(position, this.rows, this.rowPositions);
  }

  private deleteCellGroup(
    position: number,
    target: Map<ColumnKey | RowKey, CellGroup<ColumnKey | RowKey>>,
    targetPositions: Map<number, ColumnKey | RowKey>,
  ): boolean {
    const groupKey = targetPositions.get(position);
    const lastPosition = Math.max(...targetPositions.keys());

    if (groupKey !== undefined) {
      const group = target.get(groupKey);
      // Delete all cells in this group.
      for (const [oppositeKey] of group!.cellIndex) {
        group instanceof Column
          ? this.deleteCell(groupKey as ColumnKey, oppositeKey as RowKey)
          : this.deleteCell(oppositeKey as ColumnKey, groupKey as RowKey);
      }
    }

    if (position !== lastPosition) {
      this.shiftCellGroups(
        lastPosition,
        ShiftDirection.backward,
        target,
        targetPositions,
      );
    }
    return true;
  }

  private moveCellGroup(
    from: number,
    to: number,
    target: Map<ColumnKey | RowKey, CellGroup<ColumnKey | RowKey>>,
    targetPositions: Map<number, ColumnKey | RowKey>,
  ): boolean {
    if (from === to) return false;

    const groupKey = targetPositions.get(from);

    if (groupKey !== undefined) {
      const group = target.get(groupKey);
      if (group === undefined) {
        throw new Error(
          `CellGroup not found for key ${groupKey}, inconsistent state`,
        );
      }
      group.position = to;
    }

    // We have to update all the positions to keep it consistent.
    targetPositions.delete(from);
    const direction =
      to > from ? ShiftDirection.backward : ShiftDirection.forward;
    this.shiftCellGroups(to, direction, target, targetPositions);

    if (groupKey === undefined) {
      targetPositions.delete(to);
    } else {
      targetPositions.set(to, groupKey);
    }

    return true;
  }

  /**
   * Shift a CellGroup (column or row) forward or backward till an empty position is found.
   */
  private shiftCellGroups(
    start: number,
    shiftDirection: ShiftDirection,
    target: Map<ColumnKey | RowKey, CellGroup<ColumnKey | RowKey>>,
    targetPositions: Map<number, ColumnKey | RowKey>,
  ): boolean {
    let previousValue: ColumnKey | RowKey | undefined = undefined;
    let currentPos = start;
    let tempCurrent;
    do {
      tempCurrent = targetPositions.get(currentPos);

      if (previousValue === undefined) {
        // First iteration; just clear the position we're shifting from.
        targetPositions.delete(currentPos);
      } else {
        targetPositions.set(currentPos, previousValue);
        const group = target.get(previousValue);
        group!.position = currentPos;
      }

      previousValue = tempCurrent;

      if (shiftDirection === ShiftDirection.forward) {
        currentPos++;
      } else {
        if (currentPos === 0) {
          break;
        }
        currentPos--;
      }
    } while (tempCurrent !== undefined && previousValue !== undefined);

    return true;
  }

  deleteCell(colKey: ColumnKey, rowKey: RowKey): boolean {
    const col = this.columns.get(colKey);
    const row = this.rows.get(rowKey);
    if (!col || !row) return false;

    if (!col.cellIndex.has(row.key)) return false;
    const cellKey = col.cellIndex.get(row.key)!;

    // Delete cell data and all references to it in its column and row.
    this.cellData.delete(cellKey);

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

  getCellStyle(colKey?: ColumnKey, rowKey?: RowKey): CellStyle {
    const col = colKey ? this.columns.get(colKey) : null;
    const row = rowKey ? this.rows.get(rowKey) : null;
    if (!col && !row) return this.defaultStyle;

    const existingStyle = col && row ? col.cellFormatting.get(row.key) : null;
    const cellStyle = new CellStyle().clone(existingStyle);

    // Apply style properties with priority: cell style > column style > row style > default style.
    cellStyle
      .applyStylesOf(col ? col.defaultStyle : null)
      .applyStylesOf(row ? row.defaultStyle : null)
      .applyStylesOf(this.defaultStyle);

    return cellStyle;
  }

  setCellStyle(
    colPos: number,
    rowPos: number,
    style: CellStyle | null,
  ): boolean {

    const colKey = this.columnPositions.get(colPos);
    const rowKey = this.rowPositions.get(rowPos);
    if (!colKey || !rowKey) return false;
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
        const cell = this.cellData.get(cellKey)!;
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
    this.cellData.set(cell.key, cell);
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
    return this.cellData.get(cellKey)!;
  }

  private resolveCell(cell: Cell): boolean {
    const value = this.expressionHandler.evaluate(cell.formula);
    if (value == null) {
      cell.state = CellState.INVALID_EXPRESSION;
      return false;
    }

    // TODO Resolve restrictions from cell formatting here (CellState.INVALID_FORMAT).

    cell.state = CellState.OK;
    cell.value = value;
    return cell.formula != cell.value;
  }

  private initializePosition(colPos: number, rowPos: number): PositionInfo {
    let rowKey;
    let colKey;

    // Create row and column if they don't exist yet.
    if (!this.rowPositions.has(rowPos)) {
      const row = new Row(this.defaultHeight, rowPos);
      this.rows.set(row.key, row);
      this.rowPositions.set(rowPos, row.key);

      rowKey = row.key;
    } else {
      rowKey = this.rowPositions.get(rowPos)!;
    }

    if (!this.columnPositions.has(colPos)) {
      // Create a new column
      const col = new Column(this.defaultWidth, colPos);
      this.columns.set(col.key, col);
      this.columnPositions.set(colPos, col.key);

      colKey = col.key;
    } else {
      colKey = this.columnPositions.get(colPos)!;
    }

    return { rowKey: rowKey, columnKey: colKey };
  }
}
