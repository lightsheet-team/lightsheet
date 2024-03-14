import { v4 as uuidv4 } from "uuid";
export type Tagged<Type, Tag> = Type & { readonly __tag__: Tag };

export type CellKey = Tagged<string, "CellKey">;
export type ColumnKey = Tagged<string, "ColumnKey">;
export type RowKey = Tagged<string, "RowKey">;

export function tag<Tag>(value: string): Tagged<string, Tag> {
  return value as Tagged<string, Tag>;
}

export function generateCellKey(key: string = ""): CellKey {
  return tag<"CellKey">(key == "" ? uuidv4() : key);
}

export function generateColumnKey(key: string = ""): ColumnKey {
  return tag<"ColumnKey">(key == "" ? uuidv4() : key);
}

export function generateRowKey(key: string = ""): RowKey {
  return tag<"RowKey">(key == "" ? uuidv4() : key);
}
