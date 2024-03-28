// TODO We should reconsider the role/scope of this type
export type LightSheetOptions = {
  data: any[];
  columns: LightSheetColumn[];
  onCellChange?: (colIndex: number, rowIndex: number, value: any) => void;
  editable: boolean;
};

type LightSheetColumn = { type: string; title: string; name: string };
