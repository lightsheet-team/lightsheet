import { PositionInfo } from "../structure/sheet.types.ts";

export type EvaluationResult = {
  value: string;
  references: PositionInfo[];
};
