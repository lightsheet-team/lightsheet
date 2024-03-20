// TODO We should reconsider the role/scope of this type
export type LightSheetOptions = {
  data: any[];
  columns: LightSheetColumn[];
  toolbar: ToolbarItem[];
  onCellChange?: (colIndex: number, rowIndex: number, value: any) => void;
};

type LightSheetColumn = { type: string; title: string; name: string };

interface ToolbarItemBase {
  /** Means the style should be apply to the cell. */
  k: string;

  /** Tooltip shown when hovering over this option. */
  tooltip: string;
}

interface ToolbarIconItem extends ToolbarItemBase {
  id: string;
  type: "i";

  /** Defines the icon (from material icons). */
  content: string;

  /** The value of the style should be apply to the cell. */
  v: string;
}

interface ToolbarColorItem extends ToolbarItemBase {
  type: "color";

  /** Defines the icon (from material icons). */
  content: string;
}

export type ToolbarItem = ToolbarIconItem | ToolbarColorItem;
