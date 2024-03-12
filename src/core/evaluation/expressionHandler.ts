import { parse } from "mathjs";

export default class ExpressionHandler {
  static evaluate(expression: string): string {
    if (!expression.startsWith("=")) return expression;
    expression = expression.substring(1);

    const parsed = parse(expression);
    const evaluated = parsed.evaluate(); // TODO This will crash on unexpected symbols.
    return evaluated;
  }
}
