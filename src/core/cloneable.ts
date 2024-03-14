export default abstract class Cloneable<T extends object> {
  protected constructor() {}

  clone(other: T | undefined | null): this {
    if (!other) return this;

    for (const key in this) {
      if (!Object.prototype.hasOwnProperty.call(other, key)) {
        continue;
      }

      const property = Reflect.get(other, key);
      if (property instanceof Cloneable) {
        const propObj = Object.create(property);
        Reflect.set(this, key, propObj.clone(property));
        continue;
      }
      Reflect.set(this, key, property);
    }

    return this;
  }
}
