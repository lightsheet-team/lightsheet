import { KeyInfo } from "../structure/sheet.types.ts";

export type IndexInfo = {
  columnIndex?: number | null;
  rowIndex?: number | null;
};

export type UISetCellPayload = {
  keyInfo?: KeyInfo;
  indexInfo?: IndexInfo;
  rawValue: string;
};

export type CoreSetCellPayload = {
  keyInfo?: KeyInfo;
  indexInfo: IndexInfo;
  rawValue: string;
  formattedValue: string;

  clearCell?: boolean;
  clearRow?: boolean;
};

export type CoreSetStylePayload = {
  indexInfo: IndexInfo;
  value: string;
};
