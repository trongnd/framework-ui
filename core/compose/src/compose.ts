import { assignBuilderMethods, withBuilderState } from './state';
import type { BuilderState, BuilderStateData, BuilderStateMethods } from './state';

const CONTEXT = Symbol('compose::context');
const INTERNAL = Symbol('compose::internal');

/* unit */

type Unit<Builder = any> = (this: Builder, ...args: any[]) => any;

export type UnitRecord = Record<string, UnitDescriptor>;

export type UnitDescriptor<U extends Unit = any> = {
  [INTERNAL]: { unit: U; };
  id: string;
};

unit.idCounter = 0;

export function unit<U extends Unit>(): UnitDescriptor<U> {
  const id = 'unit:' + (unit.idCounter++);

  return { [INTERNAL]: null as any, id };
}

unit.optional = function<T>() {
  type UnitOptional<T> = {
    <Builder>(this: Builder, value?: T): Builder;
  };

  return unit<UnitOptional<T>>();
};

unit.value = function<T>() {
  type UnitValue<T> = {
    <Builder>(this: Builder, value: T): Builder;
  };

  return unit<UnitValue<T>>();
};

unit.values = function<T>() {
  type UnitValues<T> = {
    <Builder>(this: Builder, ...values: T[]): Builder;
  };

  return unit<UnitValues<T>>();
};

unit.func = function<Args extends any[]>() {
  type UnitFunc<Args extends any[]> = {
    <Builder>(this: Builder, ...args: Args): Builder;
  };

  return unit<UnitFunc<Args>>();
};

/* compose */

type _Compose<Builder, Context> = Omit<Builder, typeof CONTEXT> & IBuilder<Context>;

export type Compose<Builder, Context> = Builder extends IBuilder<infer C>
  ? Expand<_Compose<Builder, Expand<C & Context>>>
  : Builder;

export type ComposeOptions<Units extends UnitRecord> = {
  units: Units;
};

export type BuilderDescriptor<Units extends UnitRecord = any> = {
  [INTERNAL]: { units: Units; };
  units: Units;
  fields: (Extract<keyof Units, string>)[];
};

export function compose<Units extends UnitRecord>(options: ComposeOptions<Units>): BuilderDescriptor<Units> {
  const units = options.units;
  const fields = Object.keys(units) as (Extract<keyof Units, string>)[];

  return { [INTERNAL]: null as any, units, fields };
}

/* finalizer */

export type BuilderFinalizer<T = unknown> = () => T;

export function createFinalizer<T>(fn: BuilderFinalizer<T>): BuilderFinalizer<T> {
  return fn;
}

type FinalizerRecord = Record<string, BuilderFinalizer>;

/* builder */

type IBuilder<Context = any> = {
  [CONTEXT]: Context;
};

type Expand<T> = T extends infer O ? { [K in keyof O]: O[K]; } : never;

type GetUnit<D extends UnitDescriptor> = D[typeof INTERNAL] extends { unit: infer U; } ? U : never;

export type UnitArgs<U extends UnitDescriptor> = GetUnit<U> extends (this: any, ...args: infer A) => any ? A : never;

export type UnitValue<U extends UnitDescriptor> = UnitArgs<U> extends [] ? unknown
  : UnitArgs<U> extends [infer A] ? A
  : UnitArgs<U> extends Partial<[infer A]> ? A | null
  : unknown;

type ComposeBuilder<Units extends UnitRecord, Context> = Expand<
  & IBuilder<Context>
  & { [P in keyof Units]: GetUnit<Units[P]>; }
>;

export type GetContext<Builder, T extends string> = Builder extends IBuilder<
  { [P in T]: infer Context; }
> ? Context
  : never;

export type Builder<BuilderValue> = {
  [INTERNAL]: { builder: BuilderValue; };
  fields: string[];
};

export type BuilderOptions<Finalizers extends FinalizerRecord> = {
  finalizer?: Finalizers;
};

export type UnitValues<Units extends UnitRecord> = {
  [P in keyof Units]: UnitValue<Units[P]> | undefined;
};

export function createBuilder<
  Units extends UnitRecord = {},
  Finalizers extends FinalizerRecord = {},
>(
  descriptorOrUnits: BuilderDescriptor<Units> | Units,
  options?: BuilderOptions<Finalizers>,
) {
  const descriptor = isBuilderDescriptor(descriptorOrUnits)
    ? descriptorOrUnits
    : compose({ units: descriptorOrUnits });

  type FinalizerFns = {
    [P in keyof Finalizers]: () => ReturnType<Finalizers[P]>;
  };

  type EnhancedBuilder = Expand<ComposeBuilder<Units, {}> & FinalizerFns>;

  return (): EnhancedBuilder => {
    const state: BuilderState = {};

    const data: BuilderStateData = {};
    const methods: BuilderStateMethods = {};

    for (const field of descriptor.fields) {
      const unitDescriptor = descriptor.units[field];

      methods[field] = { id: unitDescriptor.id };

      data[field] = (...args: unknown[]) => {
        const calls = state[unitDescriptor.id];

        if (Array.isArray(calls)) {
          calls.push(args);
        } else {
          state[unitDescriptor.id] = [args];
        }

        return data;
      };
    }

    assignBuilderMethods(state, methods);

    if (options?.finalizer) {
      for (const key of Object.keys(options.finalizer) as (keyof Finalizers & string)[]) {
        const finalizer = options.finalizer[key];

        data[key] = () => withBuilderState(state, () => finalizer());
      }
    }

    return data as EnhancedBuilder;
  };
}

function isBuilderDescriptor<Units extends UnitRecord>(
  value: BuilderDescriptor<Units> | Units,
): value is BuilderDescriptor<Units> {
  return INTERNAL in value;
}
