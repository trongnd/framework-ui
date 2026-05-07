import { createBuilderInternal } from './builder';
import { INTERNAL } from './constants';
import type { UnitDescriptor, UnitRecord } from './unit';

const CONTEXT = Symbol('compose:context');
const BUILDER = Symbol('compose:builder');

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

export type FinalizerRecord = Record<string, BuilderFinalizer<any, any>>;

export type BuilderFinalizer<Args extends any[] = unknown[], Result = unknown> = (...args: Args) => Result;

export function createFinalizer<Args extends any[], Result>(
  fn: BuilderFinalizer<Args, Result>,
): BuilderFinalizer<Args, Result> {
  return fn;
}

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

export type BuilderOptions<Finalizers extends FinalizerRecord> = {
  finalizers?: Finalizers;
};

export type UnitValues<Units extends UnitRecord> = {
  [P in keyof Units]: UnitValue<Units[P]> | undefined;
};

export type BuilderMetadata<
  Units extends UnitRecord = {},
  Finalizers extends FinalizerRecord = {},
> = {
  units: Units;
  finalizers: Finalizers;
};

export type Builder<
  Units extends UnitRecord = {},
  Finalizers extends FinalizerRecord = {},
> = {
  [BUILDER]: BuilderMetadata<Units, Finalizers>;
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
    [P in keyof Finalizers]: (...args: Parameters<Finalizers[P]>) => ReturnType<Finalizers[P]>;
  };

  type EnhancedBuilder = Expand<ComposeBuilder<Units, {}> & FinalizerFns>;

  const builder = createBuilderInternal(descriptor, options?.finalizers || {});

  return builder as (() => EnhancedBuilder) & Builder<Units, FinalizerFns>;
}

export type ExtendBuilderOptions<Units extends UnitRecord, Finalizers extends FinalizerRecord> = {
  units?: Units;
  finalizer?: Finalizers;
};

export function extendBuilder<
  Units extends UnitRecord,
  Finalizers extends FinalizerRecord,
  ExtendUnits extends UnitRecord = {},
  ExtendFinalizers extends FinalizerRecord = {},
>(
  builder: Builder<Units, Finalizers>,
  args?: {
    units?: BuilderDescriptor<ExtendUnits> | ExtendUnits;
    finalizers?: ExtendFinalizers;
  },
) {
  const metadata: BuilderMetadata<Units, Finalizers> = (builder as any)[INTERNAL];

  args = args || {};

  const extendUnits = isBuilderDescriptor(args.units) ? args.units.units : (args.units || {});
  const extendFinalizers = args.finalizers || {};

  const units = {
    ...metadata.units,
    ...extendUnits,
  } as Units & ExtendUnits;

  const finalizers = {
    ...metadata.finalizers,
    ...extendFinalizers,
  } as Finalizers & ExtendFinalizers;

  return createBuilder(units, { finalizers });
}

function isBuilderDescriptor<Units extends UnitRecord>(
  value: BuilderDescriptor<Units> | Units | null | undefined,
): value is BuilderDescriptor<Units> {
  return !!value && INTERNAL in value;
}
