import { CellKey, SheetKey } from "./key/keyTypes.ts";
import Cell from "./cell/cell.ts";
import Sheet from "./sheet.ts";

export default class SheetHolder {
  sheets: Map<SheetKey, Sheet>;
  sheetNames: Map<string, SheetKey>;
  cellData: Map<CellKey, Cell>;

  private constructor() {
    this.sheets = new Map();
    this.sheetNames = new Map();
    this.cellData = new Map();
  }

  static getInstance(): SheetHolder {
    if (!window.sheetHolder) {
      window.sheetHolder = new SheetHolder();
    }
    return window.sheetHolder;
  }

  clear() {
    this.sheets.clear();
    this.sheetNames.clear();
    this.cellData.clear();
  }

  addSheet(sheet: Sheet) {
    if (this.sheets.has(sheet.key)) {
      throw new Error(`Sheet with key ${sheet.key} already exists.`);
    }

    if (this.sheetNames.has(sheet.name)) {
      throw new Error(`Sheet with name ${sheet.key} already exists.`);
    }

    this.sheets.set(sheet.key, sheet);
    this.sheetNames.set(sheet.name, sheet.key);
  }

  getSheetByName(sheetName: string): Sheet | null {
    const sheetKey = this.sheetNames.get(sheetName);
    if (!sheetKey) return null;
    return this.sheets.get(sheetKey) ?? null;
  }

  getSheet(sheetKey: SheetKey): Sheet | null {
    return this.sheets.get(sheetKey) ?? null;
  }
}
