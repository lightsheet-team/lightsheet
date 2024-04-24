import { CellKey, ColumnKey, RowKey } from "./key/keyTypes.ts";
import Cell from "./cell/cell.ts";
import Column from "./group/column.ts";
import Row from "./group/row.ts";
import { CellInfo, KeyInfo, ShiftDirection } from "./sheet.types.ts";
import ExpressionHandler from "../evaluation/expressionHandler.ts";
import CellStyle from "./cellStyle.ts";
import CellGroup from "./group/cellGroup.ts";
import Events from "../event/events.ts";
import LightsheetEvent from "../event/event.ts";
import {
  CoreSetCellPayload,
  CoreSetStylePayload,
  UISetCellPayload,
} from "../event/events.types.ts";
import EventType from "../event/eventType.ts";
import { CellState } from "./cell/cellState.ts";
import { EvaluationResult } from "../evaluation/expressionHandler.types.ts";
import LightSheetHelper from "../../../utils/helpers.ts";
import Formatter from "../evaluation/formatter.ts";

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

  private events: Events;

  constructor(events: Events | null = null) {
    this.defaultStyle = new CellStyle(); // TODO This should be configurable.

    this.settings = null;
    this.cellData = new Map<CellKey, Cell>();
    this.rows = new Map<RowKey, Row>();
    this.columns = new Map<ColumnKey, Column>();

    this.rowPositions = new Map<number, RowKey>();
    this.columnPositions = new Map<number, ColumnKey>();

    this.defaultWidth = 40;
    this.defaultHeight = 20;

    this.events = events ?? new Events();
    this.registerEvents();
  }

  getRowIndex(rowKey: RowKey): number | undefined {
    return this.rows.get(rowKey)?.position;
  }

  getColumnIndex(colKey: ColumnKey): number | undefined {
    return this.columns.get(colKey)?.position;
  }

  setCellAt(colPos: number, rowPos: number, value: string): CellInfo {
    const position = this.initializePosition(colPos, rowPos);
    return this.setCell(position.columnKey!, position.rowKey!, value)!;
  }

  setCell(colKey: ColumnKey, rowKey: RowKey, formula: string): CellInfo | null {
    if (!this.columns.has(colKey) || !this.rows.has(rowKey)) {
      return null;
    }

    let cell = this.getCell(colKey, rowKey);

    if (!cell) {
      if (formula == "") return null;
      cell = this.createCell(colKey, rowKey, formula);
    }

    cell!.rawValue = formula;

    const colIndex = this.getColumnIndex(colKey)!;
    const rowIndex = this.getRowIndex(rowKey)!;
    const deleted = this.deleteCellIfUnused(colKey, rowKey);
    if (deleted) {
      cell = null;
    } else {
      this.resolveCell(cell!, colKey, rowKey);
    }

    this.emitSetCellEvent(colKey, rowKey, colIndex, rowIndex, cell);

    return {
      rawValue: cell ? cell.rawValue : undefined,
      resolvedValue: cell ? cell.formattedValue : undefined,
      formattedValue: cell ? cell.formattedValue : undefined,
      state: cell ? cell.state : undefined,
      position: {
        rowKey: this.rows.has(rowKey) ? rowKey : undefined,
        columnKey: this.columns.has(colKey) ? colKey : undefined,
      },
    };
  }

  public getCellInfoAt(colPos: number, rowPos: number): CellInfo | null {
    const colKey = this.columnPositions.get(colPos);
    const rowKey = this.rowPositions.get(rowPos);
    if (!colKey || !rowKey) return null;

    const cell = this.getCell(colKey, rowKey)!;
    return cell
      ? {
        rawValue: cell.rawValue,
        resolvedValue: cell.resolvedValue,
        formattedValue: cell.formattedValue,
        state: cell.state,
        position: {
          columnKey: colKey,
          rowKey: rowKey,
        },
      }
      : null;
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

  private deleteCell(colKey: ColumnKey, rowKey: RowKey): boolean {
    const col = this.columns.get(colKey);
    const row = this.rows.get(rowKey);
    if (!col || !row) return false;

    if (!col.cellIndex.has(row.key)) return false;
    const cellKey = col.cellIndex.get(row.key)!;

    // Remove references to this cell from other cells' referencesOut.
    const cell = this.cellData.get(cellKey)!;
    cell.referencesIn.forEach((_, refCell) => {
      const referredCell = this.cellData.get(refCell)!;
      referredCell.referencesOut.delete(cellKey);

      // Invalidate cells that reference this cell.
      referredCell.setState(CellState.INVALID_REFERENCE);
    });

    // Remove this cell from other cells' referencesIn.
    cell.referencesOut.forEach((_, refCell) => {
      const referredCell = this.cellData.get(refCell)!;
      referredCell.referencesIn.delete(cellKey);
    });

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

    return true;
  }

  getCellStyle(colKey?: ColumnKey | null, rowKey?: RowKey | null): CellStyle {
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

  setCellFormatter(columnIndex: number,
    rowIndex: number,
    formatter: Formatter | null): void {
    let columnKey = this.columnPositions.get(columnIndex);
    let rowKey = this.rowPositions.get(rowIndex);

    if (!columnKey || !rowKey) {
      const newCellElement = this.initializePosition(columnIndex, rowIndex);
      this.createCell(newCellElement.columnKey!, newCellElement.rowKey!, "");
      columnKey = newCellElement.columnKey;
      rowKey = newCellElement.rowKey;
    }
    const col = this.columns.get(columnKey!);
    const row = this.rows.get(rowKey!);
    if (!col || !row) return;

    col.cellFormatting.set(
      row.key,
      new CellStyle(col.cellFormatting.get(rowKey!)?.styling, formatter),
    );
    row.cellFormatting.set(
      col.key,
      new CellStyle(row.cellFormatting.get(columnKey!)?.styling, formatter),
    );
    const cell = this.getCell(columnKey!, rowKey!);
    this.applyCellFormatter(cell!, columnKey!, rowKey!);

    const payload: CoreSetCellPayload = {
      keyInfo: {
        rowKey,
        columnKey,
      },
      indexInfo: {
        columnIndex,
        rowIndex,
      },
      rawValue: cell ? cell.rawValue : "",
      formattedValue: cell ? cell.formattedValue : "",
    };
    this.events.emit(new LightsheetEvent(EventType.CORE_SET_CELL, payload));

    return;
  }

  setCellCss(
    columnIndex: number,
    rowIndex: number,
    css: Map<string, string>,
  ): void {
    let colKey = this.columnPositions.get(columnIndex);
    let rowKey = this.rowPositions.get(rowIndex);

    if (!colKey || !rowKey) {
      const newCellElement = this.initializePosition(columnIndex, rowIndex);
      this.createCell(newCellElement.columnKey!, newCellElement.rowKey!, "");
      colKey = newCellElement.columnKey;
      rowKey = newCellElement.rowKey;
    }

    const col = this.columns.get(colKey!);
    const row = this.rows.get(rowKey!);
    if (!col || !row) return;

    if (css.size == 0) {
      col.cellFormatting.set(
        row.key,
        new CellStyle(null, col.cellFormatting.get(rowKey!)?.formatter),
      );
      row.cellFormatting.set(
        col.key,
        new CellStyle(null, row.cellFormatting.get(colKey!)?.formatter),
      );
      return;
    }
    // TODO Style could be non-null but empty; should we allow this?
    col.cellFormatting.set(
      row.key,
      new CellStyle(css, col.cellFormatting.get(rowKey!)?.formatter),
    );
    row.cellFormatting.set(
      col.key,
      new CellStyle(css, row.cellFormatting.get(colKey!)?.formatter),
    );

    const payload: CoreSetStylePayload = {
      indexInfo: {
        rowIndex,
        columnIndex,
      },
      value: LightSheetHelper.GenerateStyleStringFromMap(
        this.getCellStyle(colKey, rowKey).styling,
      ),
    };

    this.events.emit(new LightsheetEvent(EventType.VIEW_SET_STYLE, payload));

    return;
  }

  setColumnCss(columnIndex: number, css: Map<string, string>): void {
    const colKey = this.columnPositions.get(columnIndex);
    if (!colKey) return;

    const col = this.columns.get(colKey);
    if (!col) return;

    col.defaultStyle = new CellStyle(css, col.defaultStyle?.formatter);

    const payload: CoreSetStylePayload = {
      indexInfo: { columnIndex },
      value: LightSheetHelper.GenerateStyleStringFromMap(
        this.getCellStyle(colKey).styling,
      ),
    };

    this.events.emit(new LightsheetEvent(EventType.VIEW_SET_STYLE, payload));
  }

  setRowCss(rowIndex: number, css: Map<string, string>): void {
    const rowKey = this.rowPositions.get(rowIndex);
    if (!rowKey) return;

    const row = this.rows.get(rowKey);
    if (!row) return;

    row.defaultStyle = new CellStyle(css, row.defaultStyle?.formatter);

    const payload: CoreSetStylePayload = {
      indexInfo: { rowIndex },
      value: LightSheetHelper.GenerateStyleStringFromMap(
        this.getCellStyle(null, rowKey).styling,
      ),
    };

    this.events.emit(new LightsheetEvent(EventType.VIEW_SET_STYLE, payload));
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
        rowData.set(column.position, cell.formattedValue);
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
    cell.rawValue = value;
    this.cellData.set(cell.key, cell);
    this.resolveCell(cell, colKey, rowKey);

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

  private resolveCell(cell: Cell, colKey: ColumnKey, rowKey: RowKey): boolean {
    const valueChanged = this.resolveCellFormula(cell, colKey, rowKey);
    if (valueChanged && cell.state == CellState.OK) {
      this.applyCellFormatter(cell, colKey, rowKey);
    }

    return valueChanged;
  }

  private resolveCellFormula(
    cell: Cell,
    colKey: ColumnKey,
    rowKey: RowKey,
  ): boolean {
    const expressionHandler = new ExpressionHandler(this, cell.rawValue);
    const evalResult = expressionHandler.evaluate();
    const prevState = cell.state;
    if (!evalResult) {
      cell.setState(CellState.INVALID_EXPRESSION);
      return prevState == CellState.OK; // Consider the cell's value changed if its state changes from OK to invalid.
    }

    cell.setState(CellState.OK);

    const valueChanged = cell.resolvedValue != evalResult.value;
    cell.resolvedValue = evalResult.value;
    this.processEvaluationReferences(cell, colKey, rowKey, evalResult);

    // If the value of the cell hasn't changed, there's no need to update cells that reference this cell.
    if (!valueChanged && cell.state == CellState.OK) return valueChanged;

    // Update cells that reference this cell.
    for (const [ref, pos] of cell.referencesIn) {
      const referredCell = this.cellData.get(ref)!;
      const refUpdated = this.resolveCell(
        referredCell,
        pos.columnKey!,
        pos.rowKey!,
      );

      // Emit event if the referred cell's value has changed.
      if (refUpdated) {
        this.emitSetCellEvent(
          pos.columnKey!,
          pos.rowKey!,
          this.getColumnIndex(pos.columnKey!)!,
          this.getRowIndex(pos.rowKey!)!,
          referredCell,
        );
      }
    }

    return valueChanged;
  }

  private applyCellFormatter(
    cell: Cell,
    colKey: ColumnKey,
    rowKey: RowKey,
  ): boolean {
    const style = this.getCellStyle(colKey, rowKey);
    let formattedValue: string | null = cell.resolvedValue;
    if (style?.formatter) {
      formattedValue = style.formatter.format(formattedValue);
      if (formattedValue == null) {
        cell.setState(CellState.INVALID_FORMAT);
        return false;
      }
    }

    cell.formattedValue = formattedValue;
    return true;
  }

  /**
   * Delete a cell if it's empty, has no formatting and is not referenced by any other cell.
   */
  private deleteCellIfUnused(colKey: ColumnKey, rowKey: RowKey): boolean {
    const cell = this.getCell(colKey, rowKey)!;
    if (cell.rawValue != "") return false;

    // Check if this cell is referenced by anything.
    if (cell.referencesIn.size > 0) return false;

    // Check if cell-specific formatting is set.
    const cellCol = this.columns.get(colKey)!;
    if (cellCol.cellFormatting.has(rowKey)) return false;

    return this.deleteCell(colKey, rowKey);
  }

  /**
   * Update reference collections of cells for all cells whose values are affected.
   */
  private processEvaluationReferences(
    cell: Cell,
    columnKey: ColumnKey,
    rowKey: RowKey,
    evalResult: EvaluationResult,
  ) {
    // Update referencesOut of this cell and referencesIn of newly referenced cells.
    const oldOut = new Map<CellKey, KeyInfo>(cell.referencesOut);
    cell.referencesOut.clear();
    evalResult.references.forEach((ref) => {
      // Initialize the referred cell if it doesn't exist yet.
      const position = this.initializePosition(ref.columnIndex, ref.rowIndex);
      if (!this.getCellInfoAt(ref.columnIndex, ref.rowIndex)) {
        this.createCell(position.columnKey!, position.rowKey!, "");
      }

      const referredCell = this.getCell(position.columnKey!, position.rowKey!)!;
      // Add referred cells to this cell's referencesOut.
      cell.referencesOut.set(referredCell.key, {
        columnKey: position.columnKey!,
        rowKey: position.rowKey!,
      });

      // Add this cell to the referred cell's referencesIn.
      referredCell.referencesIn.set(cell.key, {
        columnKey: columnKey,
        rowKey: rowKey,
      });
    });

    // Resolve (oldOut - newOut) to get references that were removed from the formula.
    const removedReferences = new Map<CellKey, KeyInfo>(
      [...oldOut].filter(([cellKey]) => !cell.referencesOut.has(cellKey)),
    );

    // Clean up the referencesIn sets of cells that are no longer referenced by the formula.
    for (const [cellKey, position] of removedReferences) {
      const referredCell = this.cellData.get(cellKey)!;
      referredCell.referencesIn.delete(cell.key);

      // This may result in the cell being empty and unused - delete if necessary.
      this.deleteCellIfUnused(position.columnKey!, position.rowKey!);
    }

    // After references are updated, check for circular references.
    if (evalResult.references.length && this.hasCircularReference(cell)) {
      cell.setState(CellState.CIRCULAR_REFERENCE);
    }
  }

  private hasCircularReference(cell: Cell): boolean {
    const stack = [cell.key];
    let initial = true;

    // Depth-first search.
    while (stack.length > 0) {
      const current = stack.pop()!;
      if (current === cell.key && !initial) return true;
      initial = false;

      const currentCell = this.cellData.get(current)!;
      currentCell.referencesOut.forEach((_, ref) => {
        stack.push(ref);
      });
    }

    return false;
  }

  private initializePosition(colPos: number, rowPos: number): KeyInfo {
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

  private emitSetCellEvent(
    columnKey: ColumnKey,
    rowKey: RowKey,
    columnIndex: number,
    rowIndex: number,
    cell: Cell | null,
  ) {
    const payload: CoreSetCellPayload = {
      keyInfo: {
        rowKey,
        columnKey,
      },
      indexInfo: {
        columnIndex,
        rowIndex,
      },
      rawValue: cell ? cell.rawValue : "",
      formattedValue: cell ? cell.formattedValue : "",
      clearCell: cell == null,
      clearRow: this.rows.get(rowKey) == null,
    };

    this.events.emit(new LightsheetEvent(EventType.CORE_SET_CELL, payload));
  }

  private registerEvents() {
    this.events.on(EventType.UI_SET_CELL, (event) =>
      this.handleUISetCell(event),
    );
  }

  private handleUISetCell(event: LightsheetEvent) {
    const payload = event.payload as UISetCellPayload;
    // Use either setCellAt or setCell depending on what information is provided.
    if (payload.keyInfo) {
      this.setCell(
        payload.keyInfo.columnKey!,
        payload.keyInfo.rowKey!,
        payload.rawValue,
      );
    } else if (payload.indexInfo) {
      this.setCellAt(
        payload.indexInfo.columnIndex!,
        payload.indexInfo.rowIndex!,
        payload.rawValue,
      );
    } else {
      throw new Error(
        "Invalid event payload for UI_SET_CELL: no position info provided.",
      );
    }
  }
}
