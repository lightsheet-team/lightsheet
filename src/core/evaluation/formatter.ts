import Cloneable from "../cloneable.ts";

export default abstract class Formatter extends Cloneable<Formatter> {
  protected constructor() {
    super();
  }

  abstract format(value: string): string | null;
}
