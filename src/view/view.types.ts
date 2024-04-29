import { IndexPosition } from "../core/event/events.types";

export type CellIdInfo = {
  keyParts: string[];
  isIndex: boolean;
};

export type SelectionContainer = {
  selectionStart: IndexPosition | null;
  selectionEnd: IndexPosition | null;
};
