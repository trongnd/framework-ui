const MAPPINGS = Symbol('builder::mappings');

const STATE_STACK: Record<string, unknown>[] = [];

type MethodName = string;

export type BuilderStateMethods = Record<MethodName, unknown>;

export type BuilderStateMappings = Record<MethodName, {
  stateKey: string;
}>;

export type BuilderState = BuilderStateMethods & {
  [MAPPINGS]?: BuilderStateMappings;
};

export function getCurrentBuilderState(): BuilderState | null {
  return STATE_STACK[STATE_STACK.length - 1] ?? null;
}

export function withBuilderState<T>(state: BuilderStateMethods, fn: () => T): T {
  STATE_STACK.push(state);

  try {
    return fn();
  } finally {
    STATE_STACK.pop();
  }
}

export function applyBuilderStateMethod(state: BuilderState, field: string, args: unknown[]) {
  const calls = state[field];

  if (Array.isArray(calls)) {
    calls.push(args);
  } else {
    state[field] = [args];
  }
}

export function assignBuilderMappings(state: BuilderState, mappings: BuilderStateMappings) {
  Object.defineProperty(state, MAPPINGS, { value: mappings });
}

export function getBuilderMappings(state: BuilderState | null): BuilderStateMappings {
  const value = state?.[MAPPINGS];

  if (!value || typeof value !== 'object') {
    return {};
  }

  return value;
}
