import { SheetKey } from "../structure/key/keyTypes.ts";
import { Coordinate } from "../../utils/common.types.ts";

export type CellReference = {
  sheetKey: SheetKey;
  position: Coordinate;
};

export type EvaluationResult = {
  value: string;
  references: CellReference[];
};
