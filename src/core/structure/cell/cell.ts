import { CellKey, generateCellKey } from "../key/keyTypes";
import { CellState } from "./cellState.ts";

export default class Cell {
  key: CellKey;
  formula: string;
  value: string;
  private cellState: CellState;
  referencesIn: Set<CellKey>;
  referencesOut: Set<CellKey>;

  constructor() {
    this.key = generateCellKey();
    this.formula = "";
    this.value = "";
    this.cellState = CellState.OK;
    this.referencesIn = new Set<CellKey>();
    this.referencesOut = new Set<CellKey>();
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
