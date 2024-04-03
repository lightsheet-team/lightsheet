import Formatter from "./formatter.ts";

export default class NumberFormatter extends Formatter {
  digits: number;

  constructor(digits: number) {
    super();
    this.digits = digits;
  }

  format(value: string): string | null {
    if (value === "") return "";

    const formatted = Number(value);
    if (isNaN(formatted)) return null;

    return formatted.toFixed(this.digits) as string;
  }
}
