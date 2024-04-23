import SheetHolder from "./core/structure/sheetHolder.ts";

declare global {
  interface Window {
    sheetHolder: SheetHolder;
  }
}
