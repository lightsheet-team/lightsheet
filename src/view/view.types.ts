import { IndexInfo } from "../core/event/events.types";

export type CellIdInfo = {
  keyParts: string[];
  isIndex: boolean;
};

export type SelectionContainer = {
  selectionStart: IndexInfo | null;
  selectionEnd: IndexInfo | null;
};
