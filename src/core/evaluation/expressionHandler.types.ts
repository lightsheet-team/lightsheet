import { SheetKey } from "../structure/key/keyTypes.ts";
import { IndexInfo } from "../event/events.types.ts";

export type CellSheetPosition = {
  sheetKey: SheetKey;
  position: IndexInfo;
};

export type EvaluationResult = {
  value: string;
  references: CellSheetPosition[];
};
