// TODO This should be a common type (Coordinate in render.types.ts, IndexPosition in events.types.ts)
export type CellPosition = {
  rowIndex: number;
  columnIndex: number;
};

export type EvaluationResult = {
  value: string;
  references: CellPosition[];
};
