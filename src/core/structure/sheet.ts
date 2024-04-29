import {
  CellKey,
  ColumnKey,
  generateSheetKey,
  RowKey,
  SheetKey,
} from "./key/keyTypes.ts";
import Cell from "./cell/cell.ts";
import Column from "./group/column.ts";
import Row from "./group/row.ts";
import {
  CellInfo,
  GroupType,
  GroupTypes,
  KeyPosition,
  ShiftDirection,
} from "./sheet.types.ts";
import ExpressionHandler from "../evaluation/expressionHandler.ts";
import CellStyle from "./cellStyle.ts";
import CellGroup from "./group/cellGroup.ts";
import Events from "../event/events.ts";
import LightsheetEvent from "../event/event.ts";
import {
  CoreSetCellPayload,
  CoreSetStylePayload,
  EventType,
  UISetCellPayload,
} from "../event/events.types.ts";
import { CellState } from "./cell/cellState.ts";
import { EvaluationResult } from "../evaluation/expressionHandler.types.ts";
import Formatter from "../evaluation/formatter.ts";
import SheetHolder from "./sheetHolder.ts";
import { CellReference } from "./cell/types.cell.ts";
import { GenerateStyleStringFromMap } from "../../utils/helpers.ts";
import { IndexPosition } from "../../utils/common.types.ts";

export default class Sheet {
  key: SheetKey;
  name: string;
  sheetHolder: SheetHolder;

  cellData: Map<CellKey, Cell>;

  defaultStyle: any;
  settings: any;
  rows: Map<RowKey, Row>;
  columns: Map<ColumnKey, Column>;
  rowPositions: Map<number, RowKey>;
  columnPositions: Map<number, ColumnKey>;

  defaultWidth: number;
  defaultHeight: number;

  private events: Events;

  constructor(name: string, events: Events | null = null) {
    this.key = generateSheetKey();
    this.name = name;
    this.cellData = new Map<CellKey, Cell>();

    this.sheetHolder = SheetHolder.getInstance();
    this.sheetHolder.addSheet(this);

    this.defaultStyle = new CellStyle(); // TODO This should be configurable.
    this.settings = null;
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

    this.emitSetCellEvent(colIndex, rowIndex, cell);

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

  public moveCell(from: IndexPosition, to: IndexPosition, moveStyling: boolean = true) {
    const fromPosition = this.getCellInfoAt(
      from.columnIndex!,
      from.rowIndex!,
    )?.position;
    let toPosition = this.getCellInfoAt(
      to.columnIndex!,
      to.rowIndex!,
    )?.position;

    if (!fromPosition) return false;

    if (!toPosition) {
      toPosition = this.initializePosition(to.columnIndex!, to.rowIndex!);
    } else {
      this.deleteCell(toPosition.columnKey!, toPosition.rowKey!);
    }

    const fromCol = this.columns.get(fromPosition.columnKey!)!;
    const fromRow = this.rows.get(fromPosition.rowKey!)!;

    const toCol = this.columns.get(toPosition.columnKey!)!;
    const toRow = this.rows.get(toPosition.rowKey!)!;

    const cellKey = fromCol.cellIndex.get(fromRow.key)!;
    const style = fromCol.cellFormatting.get(fromRow.key);

    fromCol.cellIndex.delete(fromRow.key);
    toCol.cellIndex.set(toRow.key, cellKey);
    fromRow.cellIndex.delete(fromCol.key);
    toRow.cellIndex.set(toCol.key, cellKey);

    if (style && moveStyling) {
      toCol.cellFormatting.set(toRow.key, style);
      toRow.cellFormatting.set(toCol.key, style);

      fromCol.cellFormatting.delete(fromRow.key);
      fromRow.cellFormatting.delete(fromCol.key);
    }

    this.updateCellReferenceSymbols(this.cellData.get(cellKey)!, from, to);
    return true;
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
      this.updateReferenceSymbolsForGroup(group, from, to);
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
        const group = target.get(previousValue)!;
        this.updateReferenceSymbolsForGroup(group, group.position, currentPos);
        group.position = currentPos;
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

  private updateReferenceSymbolsForGroup(
    group: CellGroup<ColumnKey | RowKey>,
    from: number,
    to: number,
  ) {
    for (const [oppositeKey, cellKey] of group!.cellIndex) {
      const cell = this.cellData.get(cellKey)!;
      if (!cell.referencesIn) continue; // Only cells with incoming references are affected.

      // Convert the information on how the group is shifted into coordinates.
      // from and to can refer to either a column or row position depending on the group type.
      const oppositeGroupPos =
        group instanceof Column
          ? this.rows.get(oppositeKey as RowKey)!.position
          : this.columns.get(oppositeKey as ColumnKey)!.position;

      const fromCoord: IndexPosition = {
        columnIndex: group instanceof Column ? from : oppositeGroupPos!,
        rowIndex: group instanceof Row ? from : oppositeGroupPos!,
      };

      const toCoord: IndexPosition = {
        columnIndex: group instanceof Column ? to : oppositeGroupPos!,
        rowIndex: group instanceof Row ? to : oppositeGroupPos!,
      };

      this.updateCellReferenceSymbols(cell, fromCoord, toCoord);
    }
  }

  private updateCellReferenceSymbols(
    cell: Cell,
    from: IndexPosition,
    to: IndexPosition,
  ) {
    // Update reference symbols for all cell formulas that refer to the cell being moved.
    for (const [refCellKey, refInfo] of cell.referencesIn) {
      const refSheet = this.sheetHolder.getSheet(refInfo.sheetKey)!;
      const refCell = refSheet.cellData.get(refCellKey)!;

      const expr = new ExpressionHandler(refSheet, refInfo, refCell.rawValue);
      const newValue = expr.updatePositionalReferences(from, to);

      // The formula may not change if the cell is being referenced indirectly through a range.
      if (refCell.rawValue === newValue) continue;
      refCell.rawValue = newValue;

      // Emit event for the rawValue change.
      refSheet.emitSetCellEvent(
        refSheet.getColumnIndex(refInfo.column)!,
        refSheet.getRowIndex(refInfo.row)!,
        refCell,
      );
    }
  }

  private deleteCell(colKey: ColumnKey, rowKey: RowKey): boolean {
    const col = this.columns.get(colKey);
    const row = this.rows.get(rowKey);
    if (!col || !row) return false;

    if (!col.cellIndex.has(row.key)) return false;
    const cellKey = col.cellIndex.get(row.key)!;
    const cell = this.cellData.get(cellKey)!;

    // Clear the cell's formula to clean up any references it may have.
    cell.rawValue = "";
    this.resolveCellFormula(cell, colKey, rowKey);

    // If other cells are referring to this cell, remove the reference and invalidate them.
    cell.referencesIn.forEach((cellRef, refCellKey) => {
      const refSheet = this.sheetHolder.getSheet(cellRef.sheetKey)!;
      const referredCell = refSheet.cellData.get(refCellKey)!;
      referredCell.referencesOut.delete(cellKey);
      referredCell.setState(CellState.INVALID_REFERENCE);
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

  getMergedCellStyle(
    colKey: ColumnKey | null = null,
    rowKey: RowKey | null = null,
  ): CellStyle {
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

  private getCellGroupByIndex(columnIndex: number, rowIndex: number) {
    let columnKey = this.columnPositions.get(columnIndex);
    let rowKey = this.rowPositions.get(rowIndex);

    if (!columnKey || !rowKey) {
      const newCellElement = this.initializePosition(columnIndex, rowIndex);
      columnKey = newCellElement.columnKey;
      rowKey = newCellElement.rowKey;
    }
    return {
      column: this.columns.get(columnKey!),
      row: this.rows.get(rowKey!),
      columnKey,
      rowKey,
    };
  }

  setCellFormatter(
    columnIndex: number,
    rowIndex: number,
    formatter: Formatter | null = null,
  ): void {
    const { column, row, columnKey, rowKey } = this.getCellGroupByIndex(
      columnIndex,
      rowIndex,
    );

    if (!column || !row) return;

    if (formatter == null) {
      column.cellFormatting.get(row.key)?.clearFormatter();
      row.cellFormatting.get(column.key)?.clearFormatter();
    } else {
      column.cellFormatting.set(
        row.key,
        new CellStyle(column.cellFormatting.get(rowKey!)?.css, formatter),
      );
      row.cellFormatting.set(
        column.key,
        new CellStyle(row.cellFormatting.get(columnKey!)?.css, formatter),
      );
    }

    const cell = this.getCell(columnKey!, rowKey!);
    this.applyCellFormatter(cell!, columnKey!, rowKey!);

    this.deleteCellIfUnused(columnKey!, rowKey!);
    this.emitSetCellEvent(columnIndex, rowIndex, cell);
  }

  setCellCss(
    columnIndex: number,
    rowIndex: number,
    css: Map<string, string> = new Map(),
  ): void {
    const { column, row, columnKey, rowKey } = this.getCellGroupByIndex(
      columnIndex,
      rowIndex,
    );

    if (!column || !row) return;

    if (!css || css.size == 0) {
      column.cellFormatting.get(row.key)?.clearCss();
      row.cellFormatting.get(column.key)?.clearCss();
      this.deleteCellIfUnused(columnKey!, rowKey!);
      this.emitSetStyleEvent(
        columnIndex,
        rowIndex,
        columnKey,
      );
      return;
    }

    column.cellFormatting.set(
      row.key,
      new CellStyle(css, column.cellFormatting.get(rowKey!)?.formatter),
    );
    row.cellFormatting.set(
      column.key,
      new CellStyle(css, row.cellFormatting.get(columnKey!)?.formatter),
    );

    this.emitSetStyleEvent(
      columnIndex,
      rowIndex,
      columnKey, rowKey,
    );
  }

  setGroupCss(
    groupIndex: number,
    groupType: GroupType,
    css: Map<string, string> = new Map(),
  ): void {
    const isColumnGroup = GroupTypes.Column == groupType;
    const positions = isColumnGroup ? this.columnPositions : this.rowPositions;
    const groupKey = isColumnGroup
      ? (positions.get(groupIndex!) as ColumnKey)
      : (positions.get(groupIndex) as RowKey);
    if (!groupKey) return;
    const group = isColumnGroup
      ? this.columns.get(groupKey as ColumnKey)
      : this.rows.get(groupKey as RowKey);
    if (!group) return;

    if (!css || css.size == 0) {
      group.defaultStyle?.clearCss();
      isColumnGroup ?
        this.emitSetStyleEvent(
          groupIndex,
          null,
          groupKey as ColumnKey) :
        this.emitSetStyleEvent(
          null,
          groupIndex,
          null, groupKey as RowKey)
        ;
      return;
    }

    group.defaultStyle = new CellStyle(css, group.defaultStyle?.formatter);
    isColumnGroup ?
      this.emitSetStyleEvent(
        groupIndex,
        null,
        groupKey as ColumnKey)
      :
      this.emitSetStyleEvent(
        null,
        groupIndex,
        null, groupKey as RowKey
      );
  }

  setGroupFormatter(
    groupIndex: number,
    groupType: GroupType,
    formatter: Formatter | null = null,
  ): void {
    const isColumnGroup: boolean = groupType == GroupTypes.Column;
    const groupKey = isColumnGroup
      ? this.columnPositions.get(groupIndex)
      : this.rowPositions.get(groupIndex);
    if (!groupKey) return;
    const group = isColumnGroup
      ? this.columns.get(groupKey as ColumnKey)
      : this.rows.get(groupKey as RowKey);
    if (!group) return;

    const cellStyle = group.defaultStyle?.css
      ? new CellStyle(group.defaultStyle?.css, formatter)
      : new CellStyle(null, formatter);

    this.setCellGroupStyle(group, cellStyle);
  }

  private setCellGroupStyle(
    group: CellGroup<ColumnKey | RowKey>,
    style: CellStyle | null,
  ) {
    style = style ? new CellStyle().clone(style) : null;
    const formatterChanged = style?.formatter != group.defaultStyle?.formatter;
    group.defaultStyle = style;
    // Iterate through formatted cells in this group and clear any styling properties set by the new style.
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

    if (!formatterChanged) return;
    // Apply new formatter to all cells in this group.
    for (const [opposingKey] of group.cellIndex) {
      const cell = this.cellData.get(group.cellIndex.get(opposingKey)!)!;
      if (group instanceof Column) {
        this.applyCellFormatter(cell, group.key, opposingKey as RowKey);
        this.emitSetCellEvent(
          this.getColumnIndex(group.key as ColumnKey)!,
          this.getRowIndex(opposingKey as RowKey)!,
          cell,
        );
      } else {
        this.applyCellFormatter(
          cell,
          opposingKey as ColumnKey,
          group.key as RowKey,
        );
        this.emitSetCellEvent(
          this.getColumnIndex(opposingKey as ColumnKey)!,
          this.getRowIndex(group.key as RowKey)!,
          cell,
        );
      }
    }
  }

  private clearCellStyle(colKey: ColumnKey, rowKey: RowKey): boolean {
    const col = this.columns.get(colKey);
    const row = this.rows.get(rowKey);
    if (!col || !row) return false;

    const style = col.cellFormatting.get(row.key);
    if (style?.formatter) {
      this.applyCellFormatter(this.getCell(colKey, rowKey)!, colKey, rowKey);
    }

    col.cellFormatting.delete(row.key);
    row.cellFormatting.delete(col.key);

    // Clearing a cell's style may leave it completely empty - delete if needed.
    this.deleteCellIfUnused(colKey, rowKey);

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
        rowData.set(column.position, cell.formattedValue);
      }

      data.set(rowPos, new Map([...rowData.entries()].sort()));
    }
    return new Map([...data.entries()].sort());
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
    const expressionHandler = new ExpressionHandler(
      this,
      { sheetKey: this.key, column: colKey, row: rowKey },
      cell.rawValue,
    );
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
    for (const [refKey, refInfo] of cell.referencesIn) {
      const referringSheet = this.sheetHolder.getSheet(refInfo.sheetKey)!;
      const referringCell = referringSheet.cellData.get(refKey)!;
      const refUpdated = referringSheet.resolveCell(
        referringCell,
        refInfo.column,
        refInfo.row,
      );

      // Emit event if the referred cell's value has changed (for the referring sheet's events).
      if (refUpdated) {
        referringSheet.emitSetCellEvent(
          referringSheet.getColumnIndex(refInfo.column)!,
          referringSheet.getRowIndex(refInfo.row)!,
          referringCell,
        );
      }
    }

    return valueChanged;
  }

  private applyCellFormatter(cell: Cell, colKey: ColumnKey, rowKey: RowKey) {
    if (!cell) return;
    const style = this.getMergedCellStyle(colKey, rowKey);
    let formattedValue: string | null = cell.resolvedValue;
    if (style?.formatter) {
      formattedValue = style.formatter.format(formattedValue);
      if (formattedValue == null) {
        cell.setState(CellState.INVALID_FORMAT);
        return false;
      }
    }

    cell.formattedValue = formattedValue;
    return;
  }

  /**
   * Delete a cell if it's empty, has no formatting and is not referenced by any other cell.
   */
  private deleteCellIfUnused(colKey: ColumnKey, rowKey: RowKey): boolean {
    const cell = this.getCell(colKey, rowKey)!;
    if (!cell) return false;
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
    const oldOut = new Map<CellKey, CellReference>(cell.referencesOut);
    cell.referencesOut.clear();
    evalResult.references.forEach((ref) => {
      const refSheet = this.sheetHolder.getSheet(ref.sheetKey)!;

      // Initialize the referred cell if it doesn't exist yet.
      const position = refSheet.initializePosition(
        ref.position.columnIndex!,
        ref.position.rowIndex!,
      );
      if (
        !refSheet.getCellInfoAt(
          ref.position.columnIndex!,
          ref.position.rowIndex!,
        )
      ) {
        refSheet.createCell(position.columnKey!, position.rowKey!, "");
      }

      const referredCell = refSheet.getCell(
        position.columnKey!,
        position.rowKey!,
      )!;

      // Add referred cells to this cell's referencesOut.
      cell.referencesOut.set(referredCell.key, {
        sheetKey: refSheet.key,
        column: position.columnKey!,
        row: position.rowKey!,
      });

      // Add this cell to the referred cell's referencesIn.
      referredCell.referencesIn.set(cell.key, {
        sheetKey: this.key,
        column: columnKey,
        row: rowKey,
      });
    });

    // Resolve (oldOut - newOut) to get references that were removed from the formula.
    const removedReferences = new Map<CellKey, CellReference>(
      [...oldOut].filter(([cellKey]) => !cell.referencesOut.has(cellKey)),
    );

    // Clean up the referencesIn sets of cells that are no longer referenced by the formula.
    for (const [cellKey, refInfo] of removedReferences) {
      const referredSheet = this.sheetHolder.getSheet(refInfo.sheetKey)!;
      const referredCell = referredSheet.cellData.get(cellKey)!;
      referredCell.referencesIn.delete(cell.key);

      // This may result in the cell being unused - delete if necessary.
      referredSheet.deleteCellIfUnused(refInfo.column, refInfo.row);
    }

    // After references are updated, check for circular references.
    if (evalResult.references.length && this.hasCircularReference(cell)) {
      cell.setState(CellState.CIRCULAR_REFERENCE);
    }
  }

  private hasCircularReference(cell: Cell): boolean {
    const refStack: [CellKey, SheetKey][] = [[cell.key, this.key]];
    let initial = true;

    // Depth-first search.
    while (refStack.length > 0) {
      const current = refStack.pop()!;
      const currCellKey = current[0];
      if (currCellKey === cell.key && !initial) return true;
      initial = false;

      const currSheet = this.sheetHolder.getSheet(current[1])!;
      const currentCell = currSheet.cellData.get(currCellKey)!;
      currentCell.referencesOut.forEach((cellRef, refCellKey) => {
        refStack.push([refCellKey, cellRef.sheetKey]);
      });
    }

    return false;
  }

  private initializePosition(colPos: number, rowPos: number): KeyPosition {
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
    columnIndex: number,
    rowIndex: number,
    cell: Cell | null,
  ) {
    const payload: CoreSetCellPayload = {
      indexPosition: {
        columnIndex,
        rowIndex,
      },
      rawValue: cell ? cell.rawValue : "",
      formattedValue: cell ? cell.formattedValue : "",
    };

    this.events.emit(new LightsheetEvent(EventType.CORE_SET_CELL, payload));
  }

  private emitSetStyleEvent(
    columnIndex: number | null,
    rowIndex: number | null,
    columnKey: ColumnKey | null = null,
    rowKey: RowKey | null = null,
  ) {
    const payload: CoreSetStylePayload = {
      indexPosition: {
        rowIndex,
        columnIndex,
      },
      value: GenerateStyleStringFromMap(this.getMergedCellStyle(columnKey, rowKey).css),
    };

    this.events.emit(new LightsheetEvent(EventType.VIEW_SET_STYLE, payload));
  }

  private registerEvents() {
    this.events.on(EventType.VIEW_SET_CELL, (event) =>
      this.handleUISetCell(event),
    );
  }

  private handleUISetCell(event: LightsheetEvent) {
    const payload = event.payload as UISetCellPayload;
    // Use either setCellAt or setCell depending on what information is provided.
    if (payload.keyPosition) {
      this.setCell(
        payload.keyPosition.columnKey!,
        payload.keyPosition.rowKey!,
        payload.rawValue,
      );
    } else if (payload.indexPosition) {
      this.setCellAt(
        payload.indexPosition.columnIndex!,
        payload.indexPosition.rowIndex!,
        payload.rawValue,
      );
    } else {
      throw new Error(
        "Invalid event payload for UI_SET_CELL: no position info provided.",
      );
    }
  }
}
