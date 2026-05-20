import type { AnyFunction, Expand, Type } from '@platform/utils/types';
import { ObjectUtils } from '@platform/utils/utils';
import { Registry } from './registry';
import type { AnyDefineFn, DefineFn, RenderArgs, Variant, VariantFnArgs } from './types';
import { isVariant } from './utils';

type ConfigBase = Record<string, Type<unknown>>;
type ConfigStateBase = Record<string, unknown>;

type ConfigFn<T> = (value: T) => void;

type ConfigFns<T> = {
  [P in keyof T]: ConfigFn<T[P]>;
};

type ConfigStateItem<T> = T[] | undefined;

type ConfigState<T> = {
  [P in keyof T]?: ConfigStateItem<T[P]>;
};

type ConfigFields<T> = Expand<
  { [K in keyof T]: T[K] extends Type<infer T> ? T : T[K]; }
>;

export type VariantConfig<Config> = ConfigFns<Config>;

export type VariantConfigState<Config> = ConfigState<Config>;

export type DefineConfigFn<T = ConfigBase> = () => T;

export type DefineConfig<T extends DefineConfigFn> = ConfigFields<ReturnType<T>>;

export function applyVariant<Options, Props, Context, Config>(applyVariantArgs: {
  define: DefineFn<Options, Props, Context, DefineConfigFn<Config extends ConfigBase ? Config : {}>>;
  args: RenderArgs<Options, Props, Context, Config>;
  context: Context;
}) {
  const { define, args, context } = applyVariantArgs;

  const { config, state } = createConfig<Config>(define);

  const options = { ...args.options };
  const props = { ...args.props };

  let variant = props.variant || Registry.getDefaultVariant(args.component);

  if (ObjectUtils.isFunction(variant) && !isVariant(variant)) {
    variant = variant({} as any) as Variant<Options, Props, Context, Config>;
  }

  const fnArgs: VariantFnArgs<Options, Props, Context, Config> = {
    ...context,
    config,
    options: args.options,
    props: args.props,
    setOptions(value) {
      Object.assign(options as object, value);
    },
    setProps(value) {
      Object.assign(props, value);
    },
    applyVariant(variant) {
      variant(fnArgs);
    },
  };

  variant?.(fnArgs);

  return {
    config: state,
    options,
    props,
  };
}

export const Config = {
  call<T extends AnyFunction, R>(
    map: (state: ConfigStateItem<ReturnType<T>>) => R,
    state: ConfigStateItem<T>,
    ...args: Parameters<T>
  ) {
    const result: ConfigStateItem<ReturnType<T>> = [];

    state?.forEach((item) => {
      result.push(item.call(null, ...args));
    });

    return map(result);
  },
  get<T>(state: ConfigStateItem<T>): T | null {
    // let single value from latest call
    return (state && state[state.length - 1]) ?? null;
  },
  merge<T>(state: ConfigStateItem<T>): Partial<T> {
    // merge object values from all calls into single object
    const data: Partial<T> = {};

    state?.forEach((item) => {
      if (item) Object.assign(data, item);
    });

    return data;
  },
  concat<T>(state: ConfigStateItem<T[] | null | undefined | void>): T[] {
    // concat array values from all calls into single array
    let array: T[] = [];

    state?.forEach((item) => {
      if (item?.length) array = array.concat(item);
    });

    return array;
  },
};

const CONFIG_FNS = new WeakMap<AnyDefineFn, VariantConfig<ConfigBase>>();
const FIELD_STATE = Symbol('config:state');

function createConfig<Config>(define: AnyDefineFn) {
  const fns = getConfigFns(define);

  const state: ConfigState<ConfigFields<Config>> = {};
  const config: ConfigFns<Config> = Object.create(fns);

  Object.assign(config, { [FIELD_STATE]: state });

  return { config, state };
}

function getConfigFns(define: AnyDefineFn) {
  let fns = CONFIG_FNS.get(define);

  if (!fns) {
    fns = createConfigFns(define().config);
    CONFIG_FNS.set(define, fns);
  }

  return fns;
}

function createConfigFns(fn: DefineConfigFn) {
  const fns: ConfigFns<ConfigBase> = {};

  Object.keys(fn()).forEach((field) => {
    fns[field] = createConfigFn(field);
  });

  return fns;
}

function createConfigFn(field: string) {
  type Self = { [FIELD_STATE]: ConfigState<ConfigStateBase>; };

  return function(this: Self, value: unknown) {
    const state = this[FIELD_STATE];

    const array = state[field] = state[field] || [];

    array.push(value);
  };
}
