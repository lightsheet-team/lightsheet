import { IndexPosition } from "../utils/common.types";

export type CellIdInfo = {
  keyParts: string[];
  isIndex: boolean;
};

export type SelectionContainer = {
  selectionStart: IndexPosition | null;
  selectionEnd: IndexPosition | null;
};
