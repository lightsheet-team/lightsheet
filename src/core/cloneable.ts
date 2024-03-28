export default abstract class Cloneable<T extends object> {
  protected constructor() {}

  clone(other: T | undefined | null): this {
    if (!other) return this;

    for (const key in this) {
      if (!Object.prototype.hasOwnProperty.call(other, key)) {
        continue;
      }

      let property: any = Reflect.get(other, key);

      // Method of cloning depends on the type of the property.
      if (property instanceof Cloneable) {
        property = Object.create(property).clone(property);
      } else if (property instanceof Map) {
        property = new Map(property);
      } else if (property instanceof Array) {
        property = [...property];
      }

      Reflect.set(this, key, property);
    }

    return this;
  }
}
