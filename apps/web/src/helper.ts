//helper funktionen mit AI (Claude Sonnet 5) erstellt um nicht zu viel abzutippseln bei den typechecks für Typescript

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
