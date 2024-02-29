
export default abstract class Formatter {
    constructor() {
    }
    abstract format(value: string): string | null;
}