import { Coordinate } from "../utils/common.types.ts";

export type CellIdInfo = {
  keyParts: string[];
  isIndex: boolean;
};

export type SelectionContainer = {
  selectionStart: Coordinate | null;
  selectionEnd: Coordinate | null;
};
