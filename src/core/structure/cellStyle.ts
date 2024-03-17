import Formatter from "../evaluation/formatter";
import Cloneable from "../cloneable.ts";

export default class CellStyle extends Cloneable<CellStyle> {
  formatter: Formatter | null;
  width?: number;
  height?: number;
  color?: [number, number, number];
  borders?: [boolean, boolean, boolean, boolean];

  constructor(
    formatter: Formatter | null = null,
    width?: number,
    height?: number,
    color?: [number, number, number],
    borders?: [boolean, boolean, boolean, boolean],
  ) {
    super();
    this.formatter = formatter;
    this.width = width;
    this.height = height;
    this.color = color;
    this.borders = borders;
  }

  applyStylesOf(other: CellStyle | null): CellStyle {
    if (!other) return this;

    // If a style is set in other but not in this, apply it to this.
    for (const key in this) {
      if (
        Object.prototype.hasOwnProperty.call(other, key) &&
        !Reflect.get(this, key)
      ) {
        const otherProp = Reflect.get(other, key);
        Reflect.set(this, key, otherProp);
      }
    }

    return this;
  }

  clearStylingSetBy(other: CellStyle | null) {
    if (!other) return false;
    let isEmpty = true;

    // If a property is set in other, clear it from this.
    for (const key in this) {
      if (
        Object.prototype.hasOwnProperty.call(other, key) &&
        Reflect.get(other, key)
      ) {
        Reflect.set(this, key, undefined);
      }

      if (isEmpty && Reflect.get(this, key)) isEmpty = false;
    }

    return isEmpty;
  }
}
