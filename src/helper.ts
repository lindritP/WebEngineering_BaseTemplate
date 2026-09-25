//helper funktionen mit AI (Claude Sonnet 5) erstellt um nicht zu viel abzutippseln bei den typechecks für Typescript

export function getElement<T extends Element>(selector: string): T {
  const el = document.querySelector<T>(selector);
  if (!el) throw new Error(`Missing element: ${selector}`);
  return el;
}

export function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value != null
}