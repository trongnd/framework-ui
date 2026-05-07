import type { UnitArgs, UnitValue } from './compose';
import { getBuilderMappings } from './state';
import type { BuilderState } from './state';
import type { UnitDescriptor, UnitRecord } from './unit';

export type BuilderDataEntry<Unit extends UnitDescriptor> = {
  called(): boolean;
  defaulted<T extends UnitValue<Unit>>(...value: [T] | [called: T, notCalled: T]): T;
  get(): UnitValue<Unit> | null;
  getArgs(): UnitArgs<Unit> | null;
  list(): (UnitValue<Unit> | null)[];
  listArgs(): UnitArgs<Unit>[];
};

export type BuilderData<Units extends UnitRecord = any> = {
  [P in keyof Units]: BuilderDataEntry<Units[P]>;
};

export function createBuilderData<Units extends UnitRecord>(
  state: BuilderState | null,
): BuilderData<Units> {
  const methods = getBuilderMappings(state);

  const data = {} as BuilderData<Units>;

  for (const key of Object.keys(methods) as (keyof Units & string)[]) {
    const calls = getBuilderDataCalls(state?.[methods[key].stateKey]);
    const lastCall = calls[calls.length - 1];

    const entry = {} as BuilderDataEntry<Units[keyof Units]>;

    entry.called = () => {
      return calls.length > 0;
    };

    entry.get = () => {
      return getBuilderDataValue(lastCall) as any;
    };

    entry.getArgs = () => {
      return getBuilderDataArgs(lastCall) as any;
    };

    entry.list = () => {
      return calls.map((call) => getBuilderDataValue(call) as any);
    };

    entry.listArgs = () => {
      return calls.map((call) => getBuilderDataArgs(call) as any);
    };

    entry.defaulted = (...args) => {
      const value = entry.get() ?? (args.length === 2 ? (entry.called() ? args[0] : args[1]) : args[0]);

      return value as any;
    };

    data[key] = entry;
  }

  return data;
}

function getBuilderDataCalls(value: unknown): unknown[][] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(Array.isArray).map((entry) => [...entry]);
}

function getBuilderDataValue(args: unknown[] | undefined) {
  if (!args || args.length === 0) {
    return null;
  }

  if (args.length === 1) {
    return args[0] ?? null;
  }

  return args;
}

function getBuilderDataArgs(args: unknown[] | undefined) {
  if (!args) return null;

  return [...args];
}
