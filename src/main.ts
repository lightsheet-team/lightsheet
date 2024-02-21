import { renderHtml } from "./ui/render.ts";
import sheet from "./core/sheet.ts";

export default class main {
  constructor(targetElementId: string) {
    document.getElementById(targetElementId)!.innerHTML = renderHtml();

    const newSheet = new sheet();
    console.log(newSheet.test());
  }
}
