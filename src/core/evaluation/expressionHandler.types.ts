import { SheetKey } from "../structure/key/keyTypes.ts";
import { Coordinate } from "../../utils/common.types.ts";

export type CellSheetPosition = {
  sheetKey: SheetKey;
  position: Coordinate;
};

export type EvaluationResult = {
  value: string;
  references: CellSheetPosition[];
};
