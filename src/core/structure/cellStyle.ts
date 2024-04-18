import Formatter from "../evaluation/formatter";
import Cloneable from "../cloneable.ts";

export default class CellStyle extends Cloneable<CellStyle> {
  formatter: Formatter | null;
  styling: Map<string, string>;

  constructor(
    styling: Map<string, string> | null = null,
    formatter: Formatter | null = null,
  ) {
    super();
    this.formatter = formatter;
    this.styling = new Map(styling);
  }

  applyStylesOf(other: CellStyle | null): CellStyle {
    if (!other) return this;

    // If a style is set in other but not in this, apply it to this.
    for (const [key, value] of other.styling) {
      if (!this.styling.has(key)) {
        this.styling.set(key, value);
      }
    }

    if (other.formatter && !this.formatter) {
      this.formatter = Object.create(other.formatter).clone(other.formatter);
    }

    return this;
  }

  applyCss(css: Map<string, string>): CellStyle {

    // If a style is set in other but not in this, apply it to this.
    for (const [key, value] of css) {
      if (!this.styling.has(key)) {
        this.styling.set(key, value);
      }
    }

    return this;
  }

  clearStylingSetBy(other: CellStyle | null) {
    if (!other) return false;
    let isEmpty = true;

    // If a property is set in other, clear it from this.
    for (const key in other.styling) {
      if (this.styling.has(key)) {
        this.styling.delete(key);
      }

      if (other.formatter) this.formatter = null;

      if (isEmpty && (this.styling.has(key) || this.formatter)) isEmpty = false;
    }

    return isEmpty;
  }
}
