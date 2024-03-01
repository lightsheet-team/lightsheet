import {CellKey, generateCellKey} from "./keyTypes";

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
    this.state = CellState.CELL_OK;
    this.referencesIn = [];
    this.referencesOut = [];
  }
}

// Initial structure, move to separate file
export enum CellState {
  CELL_OK,
}
