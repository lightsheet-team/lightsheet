// TODO We should reconsider the role/scope of this type
export type LightSheetOptions = {
  data: any[];
  columns: LightSheetColumn[];
  onCellChange?: (colIndex: number, rowIndex: number, value: any) => void;
  isReadOnly: boolean;
};

type LightSheetColumn = { type: string; title: string; name: string };
