//helper funktionen mit AI (Claude Sonnet 5) erstellt um nicht zu viel abzutippseln bei den typechecks für Typescript

// Looks up an element and checks at runtime that it really is of the given
// element class (e.g. HTMLInputElement), instead of just claiming a type.
export function getElement<T extends Element>(
  selector: string,
  type: new () => T
): T {
  const el = document.querySelector(selector);
  if (!(el instanceof type)) {
    throw new Error(`Missing element or wrong type: ${selector}`);
  }
  return el;
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
