import { CellKey, generateCellKey } from "../key/keyTypes";

export default class Cell {
  key: CellKey;
  formula: string;
  value: string;
  state: CellState;
  referencesIn: Set<CellKey>;
  referencesOut: Set<CellKey>;

  constructor() {
    this.key = generateCellKey();
    this.formula = "";
    this.value = "";
    this.state = CellState.OK;
    this.referencesIn = new Set<CellKey>();
    this.referencesOut = new Set<CellKey>();
  }
}

// Initial structure, move to separate file
export enum CellState {
  OK,
  INVALID_EXPRESSION,
  INVALID_REFERENCE,
  CIRCULAR_REFERENCE,
  INVALID_FORMAT,
}
