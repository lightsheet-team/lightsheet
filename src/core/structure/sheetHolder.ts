import LightSheet from "../../main.ts";
import { CellKey, SheetKey } from "./key/keyTypes.ts";
import Cell from "./cell/cell.ts";

export default class SheetHolder {
  sheets: Map<SheetKey, LightSheet>;
  sheetNames: Map<string, SheetKey>;
  cellData: Map<CellKey, Cell>;

  constructor() {
    this.sheets = new Map();
    this.sheetNames = new Map();
    this.cellData = new Map();

    if (window.sheetHolder) {
      return window.sheetHolder;
    }
    window.sheetHolder = this;
  }

  clear() {
    this.sheets.clear();
    this.sheetNames.clear();
    this.cellData.clear();
  }

  addSheet(sheet: LightSheet) {
    if (this.sheets.has(sheet.getKey())) {
      throw new Error(`Sheet with key ${sheet.getKey()} already exists.`);
    }

    if (this.sheetNames.has(sheet.getName())) {
      throw new Error(`Sheet with name ${sheet.getName()} already exists.`);
    }

    this.sheets.set(sheet.getKey(), sheet);
    this.sheetNames.set(sheet.getName(), sheet.getKey());
  }

  getSheetByName(sheetName: string): LightSheet | null {
    const sheetKey = this.sheetNames.get(sheetName);
    if (!sheetKey) return null;
    return this.sheets.get(sheetKey) ?? null;
  }

  getSheet(sheetKey: SheetKey): LightSheet | null {
    return this.sheets.get(sheetKey) ?? null;
  }
}
