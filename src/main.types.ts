// TODO We should reconsider the role/scope of this type
export type LightSheetOptions = {
  data: any[];
  columns: LightSheetColumn[];
  toolbarOptions?: ToolbarOptions;
};

type LightSheetColumn = { type: string; title: string; name: string };

export type ToolbarItem = string;

export type ToolbarOptions = {
  showToolbar: boolean;
  items: ToolbarItem[];
  element?: HTMLElement;
};
