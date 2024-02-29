import Formatter from "./formatter";

export default class CellStyle {
  formatter: Formatter | null;
  width: number;
  height: number;
  color: [number, number, number];
  borders: [boolean, boolean, boolean, boolean];

  constructor(
    formatter: Formatter | null = null,
    width: number = 30,
    height: number = 10,
  ) {
    this.formatter = formatter;
    this.width = width;
    this.height = height;
    this.color = [255, 255, 255];
    this.borders = [false, false, false, false];
  }
}
