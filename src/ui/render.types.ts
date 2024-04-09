export type CellIdInfo = {
  keyParts: string[];
  isIndex: boolean;
};

export type SelectionContainer = {
  selectionStart: Coordinate | null;
  selectionEnd: Coordinate | null;
};

export type Coordinate = {
  rowPosition: number;
  columnPosition: number;
};

export type SelectCell = {
  col: number;
  row: number;
};
