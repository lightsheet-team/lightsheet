import { CellKey, generateCellKey } from "../key/keyTypes";
import { CellState } from "./cellState.ts";
import { KeyInfo } from "../sheet.types.ts";

export default class Cell {
  key: CellKey;
  rawValue: string; // User input.
  resolvedValue: string; // Resolved value of a formula in rawValue.
  formattedValue: string; // resolvedValue with formatting rules applied.
  private cellState: CellState;

  // References in this cell's formula.
  referencesIn: Map<CellKey, KeyInfo>;
  referencesOut: Map<CellKey, KeyInfo>;

  constructor() {
    this.key = generateCellKey();
    this.rawValue = "";
    this.resolvedValue = "";
    this.formattedValue = "";
    this.cellState = CellState.OK;
    this.referencesIn = new Map<CellKey, KeyInfo>();
    this.referencesOut = new Map<CellKey, KeyInfo>();
  }

  get state() {
    return this.cellState;
  }

  setState(state: CellState) {
    this.cellState = state;
    if (state != CellState.OK) {
      this.resolvedValue = "";
      this.formattedValue = "";
    }
  }
}
