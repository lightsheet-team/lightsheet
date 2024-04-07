import Formatter from "./formatter.ts";

export default class NumberFormatter extends Formatter {
  decimalDigits: number;

  constructor(decimalDigits: number) {
    super();
    this.decimalDigits = decimalDigits;
  }

  format(value: string): string | null {
    if (value === "") return "";

    const formatted = Number(value);
    if (isNaN(formatted)) return null;

    return formatted.toFixed(this.decimalDigits).toString();
  }
}
