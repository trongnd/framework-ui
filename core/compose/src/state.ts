const METHODS = Symbol('compose::methods');

const STATE_STACK: Record<string, unknown>[] = [];

export type BuilderStateData = Record<string, unknown>;
export type BuilderStateMethods = Record<string, { id: string; }>;

export type BuilderState = BuilderStateData & {
  [METHODS]?: BuilderStateMethods;
};

export function getCurrentBuilderState(): BuilderState | null {
  return STATE_STACK[STATE_STACK.length - 1] ?? null;
}

export function withBuilderState<T>(state: BuilderStateData, fn: () => T): T {
  STATE_STACK.push(state);

  try {
    return fn();
  } finally {
    STATE_STACK.pop();
  }
}

export function assignBuilderMethods(state: BuilderState, methods: BuilderStateMethods) {
  Object.defineProperty(state, METHODS, {
    value: methods,
  });
}

export function getBuilderMethods(state: BuilderState | null): BuilderStateMethods {
  const value = state?.[METHODS];

  if (!value || typeof value !== 'object') {
    return {};
  }

  return value;
}
