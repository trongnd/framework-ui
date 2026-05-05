import type { UnitArgs, UnitDescriptor, UnitRecord, UnitValue } from './compose';
import { getBuilderMethods } from './state';
import type { BuilderState } from './state';

export type BuilderDataEntry<Unit extends UnitDescriptor> = {
  called(): boolean;
  defaulted(called: UnitValue<Unit>, notCalled: UnitValue<Unit>): UnitValue<Unit>;
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
  const methods = getBuilderMethods(state);

  const data = {} as BuilderData<Units>;

  for (const key of Object.keys(methods) as (keyof Units & string)[]) {
    const calls = getBuilderDataCalls(state?.[methods[key].id]);
    const lastCall = calls[calls.length - 1];

    const entry = {} as BuilderDataEntry<Units[keyof Units]>;

    entry.called = () => calls.length > 0;
    entry.get = () => getBuilderDataValue(lastCall) as any;
    entry.getArgs = () => getBuilderDataArgs(lastCall) as any;
    entry.list = () => calls.map((call) => getBuilderDataValue(call) as any);
    entry.listArgs = () => calls.map((call) => getBuilderDataArgs(call) as any);

    entry.defaulted = (called, notCalled) => entry.get() ?? (entry.called() ? called : notCalled);

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
