import { v4 as uuidv4 } from 'uuid';
// OPTION 1, class based structure
// slight runtime overhead due to object creation 
class Key<T> {
    private key: string;

    constructor() {
        this.key = uuidv4();
    }
    //  different types cannot be considered equal
    equals(other: Key<T>): boolean {
        return this.key === other.key;
    }

    toString(): string {
        return `${this.constructor.name}: ${this.key}`;
    }
}
// TODO: separate files for clarity, if we choose option 1
export class CellKey extends Key<CellKey> {}
export class ColumnKey extends Key<ColumnKey> {}



// OPTION 2 using tagged types (or branded)
// Also string literal types are possible, 
// We could also use tagged or branded types -> these are treated as unique types by the type system

// export type Tagged<Type, Tag> = Type & { readonly __tag__: Tag };

// export type CellKey = Tagged<string, 'CellKey'>;
// export type ColumnKey = Tagged<string, 'ColumnKey'>;
// // Continue with other key types as needed

// export function tag<Type, Tag>(value: Type, tag: Tag): Tagged<Type, Tag> {
//     return value as Tagged<Type, Tag>;
// }

// // example usage:
// function generateCellKey(): CellKey {
//     return tag(uuidv4(), 'CellKey');
// }