import Cloneable from "../cloneable.ts";
import NumberFormatter from "./numberFormatter.ts";

export default abstract class Formatter extends Cloneable<Formatter> {

  private static formatters: Map<string, Formatter> = new Map()
  protected constructor() {
    super();
  }

  static registerFormatter(name: string, formatter: Formatter) {
    this.formatters.set(name, formatter);
  }

  static createFormatter(type: string | undefined, options: any): Formatter | null {
    if (!type) return null
    switch (type) {
      case 'number':
        if (options.decimal && options.decimal === 0) return null
        return new NumberFormatter(options.decimal);

      default:
        return null
    }

  }

  abstract format(value: string): string | null;
}
