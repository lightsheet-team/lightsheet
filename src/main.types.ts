// TODO We should reconsider the role/scope of this type
export type LightSheetOptions = {
  data: any[];
  columns: LightSheetColumn[];
};

type LightSheetColumn = { type: string; title: string; name: string };
