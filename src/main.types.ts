// TODO We should reconsider the role/scope of this type
export type LightSheetOptions = {
  data: any[];
  sheetName: string;
  onCellChange?: (colIndex: number, rowIndex: number, value: any) => void;
  onCellClick?: (colIndex: number, rowIndex: number) => void;
  onReady?: () => void;
  defaultRowCount?: number;
  defaultColCount?: number;
  isReadOnly?: boolean;
};
