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
  }

  addSheet(sheet: LightSheet): boolean {
    if (
      this.sheets.has(sheet.getKey()) ||
      this.sheetNames.has(sheet.getName())
    ) {
      return false;
    }
    this.sheets.set(sheet.getKey(), sheet);
    this.sheetNames.set(sheet.getName(), sheet.getKey());
    return true;
  }

  getSheetByName(sheetName: string): LightSheet | null {
    const sheetKey = this.sheetNames.get(sheetName);
    if (!sheetKey) return null;
    return this.sheets.get(sheetKey) ?? null;
  }

  getSheet(sheetKey: SheetKey): LightSheet | null {
    return this.sheets.get(sheetKey) ?? null;
  }

  getCellFromSheet(sheetName: string, cellKey: CellKey): Cell | null {
    const sheetKey = this.sheetNames.get(sheetName);
    if (!sheetKey || !this.sheets.has(sheetKey)) return null;
    const lightsheet = this.sheets.get(sheetKey)!;
    return lightsheet.sheetHolder.cellData.get(cellKey) ?? null; // TODO Shouldn't directly access cellData or return a Cell object.
  }
}
