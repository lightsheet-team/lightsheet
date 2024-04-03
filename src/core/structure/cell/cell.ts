import { CellKey, generateCellKey } from "../key/keyTypes";
import { CellState } from "./cellState.ts";
import { PositionInfo } from "../sheet.types.ts";

export default class Cell {
  key: CellKey;
  formula: string;
  value: string;
  private cellState: CellState;

  // References in this cell's formula.
  referencesIn: Map<CellKey, PositionInfo>;
  referencesOut: Map<CellKey, PositionInfo>;

  constructor() {
    this.key = generateCellKey();
    this.formula = "";
    this.value = "";
    this.cellState = CellState.OK;
    this.referencesIn = new Map<CellKey, PositionInfo>();
    this.referencesOut = new Map<CellKey, PositionInfo>();
  }

  get state() {
    return this.cellState;
  }

  setState(state: CellState) {
    this.cellState = state;
    if (state != CellState.OK) {
      this.value = "";
    }
  }
}
