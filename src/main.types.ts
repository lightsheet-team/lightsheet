// TODO We should reconsider the role/scope of this type
export type LightSheetOptions = {
  data: any[];
  columns: LightSheetColumn[];
  FormulaBarOptions?: FormulaBarOptions;
  onCellChange?: (colIndex: number, rowIndex: number, value: any) => void;
};

type LightSheetColumn = { type: string; title: string; name: string };

export type FormulaBarOptions = {
  showToolbar: boolean;
  element?: HTMLElement;
};
