import { IndexPosition } from "../../utils/common.types.ts";
import { SheetKey } from "../structure/key/keyTypes.ts";

export type CellSheetPosition = {
  sheetKey: SheetKey;
  position: IndexPosition;
};

export type EvaluationResult = {
  value: string;
  references: CellSheetPosition[];
};
