// TODO We should reconsider the role/scope of this type
export type LightSheetOptions = {
  sheetName: string;
  data?: any[];
  onCellChange?: (colIndex: number, rowIndex: number, value: any) => void;
  onCellClick?: (colIndex: number, rowIndex: number) => void;
  onReady?: () => void;
  defaultRowCount?: number;
  defaultColCount?: number;
  isReadOnly?: boolean;
  toolbarOptions?: ToolbarOptions;
  contextMenuOptions?: ContextMenuOptions;
};

export type ToolbarOptions = {
  showToolbar?: boolean;
  items?: string[];
  element?: HTMLElement;
};

export type ContextMenuOptions = {
  showContextMenu?: boolean;
  items?: string[];
  element?: HTMLElement;
};
