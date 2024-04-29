import { SheetKey } from "../structure/key/keyTypes.ts";
import { IndexPosition } from "../event/events.types.ts";

export type CellSheetPosition = {
  sheetKey: SheetKey;
  position: IndexPosition;
};

export type EvaluationResult = {
  value: string;
  references: CellSheetPosition[];
};
