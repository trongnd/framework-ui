import type { UnitArgs } from './compose';
import { applyBuilderStateMethod, getCurrentBuilderState } from './state';
import { createUnit } from './unit';
import type { Unit, UnitDescriptor, UnitRecord } from './unit';

const DERIVE_TYPE = Symbol('derive:type');
const DERIVE_METADATA = Symbol('derive:metadata');
const DERIVE_STATE = Symbol('derive:state');
const DERIVE_UNITS = Symbol('derive:units');

type DeriveMetadata = {
  callback: DeriveUnitCallback<any, any>;
  units: DeriveCallbackUnits<any> | null;
};

export type DeriveCallbackUnits<Units extends UnitRecord> = {
  [P in keyof Units]: (...args: UnitArgs<Units[P]>) => unknown;
};

export type DeriveUnitCallback<Units extends UnitRecord, U extends Unit> = {
  (...args: UnitArgs<UnitDescriptor<U>>): (units: DeriveCallbackUnits<Units>) => unknown;
};

export type DeriveValueCallback<Units extends UnitRecord> = {
  (units: DeriveCallbackUnits<Units>): unknown;
};

export type DeriveFuncCallback<Units extends UnitRecord, Args extends any[]> = {
  (...args: Args): (units: DeriveCallbackUnits<Units>) => unknown;
};

export type DeriveValue<Value, Units extends UnitRecord = any> = {
  [DERIVE_TYPE]: 'value';
  [DERIVE_UNITS]: DeriveCallbackUnits<Units>;
  //
  value: Value;
  callback: DeriveValueCallback<Units>;
};

export type DeriveFunc<Args extends any[], Units extends UnitRecord = any> = {
  [DERIVE_TYPE]: 'func';
  [DERIVE_UNITS]: DeriveCallbackUnits<Units>;
  //
  callback: DeriveFuncCallback<Units, Args>;
};

export type InferDeriveValue<T> = T extends
  DeriveValue<infer T> | DeriveValue<infer T>[] | Record<any, DeriveValue<infer T>> ? T : unknown;

export type Derive<Units extends UnitRecord> = {
  [DERIVE_UNITS]: DeriveCallbackUnits<Units>;
  //
  unit<U extends Unit>(unit: UnitDescriptor<U>, callback: DeriveUnitCallback<Units, NoInfer<U>>): UnitDescriptor<U>;
  value<const T>(value: T, callback: DeriveValueCallback<Units>): DeriveValue<T, Units>;
  func<const Args extends any[]>(callback: DeriveFuncCallback<Units, Args>): DeriveFunc<Args, Units>;
};

export const derive = {
  create: createDerive,
  unit: createDeriveUnitFromValues,
  map: createDeriveValueMap,
  apply: applyDeriveValue,
};

function createDerive<Units extends UnitRecord>(units: Units) {
  const callbackUnits = createDeriveCallbackUnits(units);

  const unit: Derive<Units>['unit'] = (unit, callback) => {
    return createDeriveUnit(unit, callback, callbackUnits);
  };

  const value: Derive<Units>['value'] = (value, callback) => {
    return {
      [DERIVE_TYPE]: 'value',
      [DERIVE_UNITS]: callbackUnits,
      value,
      callback,
    };
  };

  const fn: Derive<Units>['func'] = (callback) => {
    return {
      [DERIVE_TYPE]: 'func',
      [DERIVE_UNITS]: callbackUnits,
      callback,
    };
  };

  const derive: Derive<Units> = {
    [DERIVE_UNITS]: callbackUnits,
    unit,
    value,
    func: fn,
  };

  return derive;
}

function createDeriveCallbackUnits<Units extends UnitRecord>(units: Units) {
  const fns: Record<string, unknown> = {};

  Object.keys(units).forEach((key) => {
    const fn = createDeriveCallbackUnitFn(key);

    fns[key] = fn;
  });

  return fns as DeriveCallbackUnits<Units>;
}

function createDeriveCallbackUnitFn(key: string) {
  return function(this: unknown, ...args: any[]) {
    const state = (this as any)[DERIVE_STATE];

    applyBuilderStateMethod(state, key, args);
  };
}

function createDeriveCallbackUnitsInstance(units: DeriveCallbackUnits<any>) {
  const instance = Object.create(units);

  Object.assign(units, {
    [DERIVE_STATE]: getCurrentBuilderState(),
  });

  return instance;
}

type UnitDeriveFuncApply<Args extends any[]> = {
  <Builder>(this: Builder, ...args: Args): Builder;
};

type UnitDeriveFuncUse = {
  <Builder, Units extends UnitRecord, Args extends any[]>(
    this: Builder,
    func: DeriveFunc<Args, Units>,
    ...args: Args
  ): Builder;
};

export function createUseDeriveFuncUnit<Units extends UnitRecord, Args extends any[]>(
  func: DeriveFunc<Args, Units>,
): UnitDescriptor<UnitDeriveFuncApply<Args>>;
export function createUseDeriveFuncUnit(): UnitDescriptor<UnitDeriveFuncUse>;
export function createUseDeriveFuncUnit(func?: DeriveFunc<any>): UnitDescriptor<any> {
  return createDeriveUnit(createUnit(), (...args) => () => {
    if (func) {
      applyDeriveFunc(func, args);
    } else {
      applyDeriveFunc(args[0] as DeriveFunc<any>, args.slice(1));
    }
  });
}

export function createDeriveUnit<Units extends UnitRecord, U extends Unit>(
  _unit: UnitDescriptor<U>,
  callback: DeriveUnitCallback<Units, U>,
  units?: DeriveCallbackUnits<Units>,
) {
  const derivedUnit = createUnit<U>();

  const metadata: DeriveMetadata = {
    callback,
    units: units || null,
  };

  Object.assign(derivedUnit, {
    [DERIVE_METADATA]: metadata,
  });

  return derivedUnit;
}

export function getUnitDeriveMetadata(unit: UnitDescriptor): DeriveMetadata | null {
  return (unit as any)?.[DERIVE_METADATA] ?? null;
}

type ApplyDeriveUnitArgs<Units extends UnitRecord, Args extends any[]> = {
  [P in keyof Args]: DeriveValue<Args[P], Units>[] | null | undefined;
};

export function createDeriveUnitFromValues<Units extends UnitRecord, U extends Unit>(
  unit: UnitDescriptor<U>,
  ...values: ApplyDeriveUnitArgs<Units, UnitArgs<UnitDescriptor<U>>>
) {
  const maps = values.map((value) => createDeriveValueMap(value || []));

  return createDeriveUnit(unit, () => (...args) => {
    args.forEach((arg, index) => applyDeriveValue(maps[index](arg)));
  });
}

export function applyDeriveUnitFromMetadata(
  deriveUnit: DeriveMetadata,
  args: unknown[],
) {
  const units = createDeriveCallbackUnitsInstance(deriveUnit.units || {});

  deriveUnit.callback(...args)(units);
}

export function applyDeriveValue<Units extends UnitRecord, Value>(
  value: DeriveValue<Value, Units>,
) {
  const units = createDeriveCallbackUnitsInstance(value[DERIVE_UNITS]);

  value.callback(units);
}

export function applyDeriveFunc<Args extends any[], Units extends UnitRecord>(
  func: DeriveFunc<Args, Units>,
  args: Args,
) {
  const units = createDeriveCallbackUnitsInstance(func[DERIVE_UNITS]);

  func.callback(...args)(units);
}

export function createDeriveValueMap<Value, Units extends UnitRecord>(values: DeriveValue<Value, Units>[]) {
  const map = new Map<Value, DeriveValue<Value, Units>>();

  values.forEach((value) => {
    map.set(value.value, value);
  });

  const get = (value: Value) => {
    const val = map.get(value);
    if (!val) throw '[Derived] map.get: VALUE_NOT_FOUND';
    return val;
  };

  get.optional = (value: Value) => {
    return map.get(value);
  };

  return get;
}
