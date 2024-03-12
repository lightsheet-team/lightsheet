import { CellKey, generateCellKey } from "../key/keyTypes";

export default class Cell {
  key: CellKey;
  formula: string;
  value: string;
  state: CellState;
  referencesIn: CellKey[];
  referencesOut: CellKey[];

  constructor() {
    this.key = generateCellKey();
    this.formula = "";
    this.value = "";
    this.state = CellState.OK;
    this.referencesIn = [];
    this.referencesOut = [];
  }
}

// Initial structure, move to separate file
export enum CellState {
  OK,
  INVALID_EXPRESSION,
  INVALID_FORMAT,
}
