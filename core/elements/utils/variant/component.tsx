import { forwardRef } from 'react';
import type { DefineConfig, DefineConfigFn } from './config';
import { Registry } from './registry';
import { ComponentRender } from './render';
import type {
  AnyVariant,
  AnyVariantFn,
  CreateComponent,
  CreateVariant,
  DefineArgs,
  DefineFn,
  RenderFn,
  SetDefaultProps,
  SetDefaultVariant,
  VariantComponent,
  VariantComponentProps,
} from './types';
import { isVariant, VARIANT } from './utils';

export function defineVariantComponent<Options, Props, Context, ConfigFn extends DefineConfigFn>(
  args: DefineArgs<Options, Props, Context, ConfigFn>,
) {
  return args;
}

export function createVariantComponent<Options, Props, Context, ConfigFn extends DefineConfigFn>(
  define: DefineFn<Options, Props, Context, ConfigFn>,
  args: { options: Options; },
) {
  const { options } = args;

  type Config = DefineConfig<ConfigFn>;
  type ComponentProps = VariantComponentProps<Options, Props, Context, Config>;

  const ForwardRefComponent = forwardRef<unknown, ComponentProps>((props, ref) => {
    return (
      <ComponentRender<Options, Props, Context, ConfigFn>
        component={Component}
        define={define}
        options={options}
        forwardedRef={ref}
        props={props as ComponentProps}
      />
    );
  });

  const Component = ForwardRefComponent as VariantComponent<Options, Props, Context, Config>;

  const createComponent: CreateComponent<Options, Props, Context, Config> = (fn) => {
    const variant = createVariant(fn);

    const { Component, setDefaultVariant } = createVariantComponent(define, { options });

    setDefaultVariant(variant);

    return Component;
  };

  const createVariant: CreateVariant<Options, Props, Context, Config> = (...args: any[]): any => {
    let fn: AnyVariantFn = args[0];
    let defaultParams: object | null = null;
    let hasParams = false;

    if (args.length === 2) {
      hasParams = true;
      defaultParams = args[0];
      fn = args[1];
    }

    const toVariant = (fn: AnyVariantFn) => {
      const variant: AnyVariant = (...args) => fn(...args);

      variant[VARIANT] = true;

      return variant;
    };

    if (!hasParams) {
      return toVariant((args) => fn(args));
    }

    return (params: object) =>
      toVariant((args) => {
        const props = {
          ...defaultParams,
          ...args.props,
          ...params,
        };

        return fn({ ...args, props });
      });
  };

  const setDefaultVariant: SetDefaultVariant<Options, Props, Context, Config> = (variant) => {
    if (variant && !isVariant(variant)) {
      variant = createVariant(variant);
    }

    Registry.setDefaultVariant(Component, variant as AnyVariant | null);
  };

  const setDefaultProps: SetDefaultProps<Options, Props, Context, Config> = (props) => {
    Registry.setDefaultProps(Component, props);
  };

  return {
    Component,
    createComponent,
    createVariant,
    setDefaultVariant,
    setDefaultProps,
  };
}

export function renderVariantComponent<Options, Props, Context, ConfigFn extends DefineConfigFn>(
  define: DefineFn<Options, Props, Context, ConfigFn>,
  fn: RenderFn<Options, Props, Context, DefineConfig<ConfigFn>>,
) {
  Registry.setRenderFn(define, fn);
}

export function wrapComponent<
  F extends <C extends object>(Component: C) => object,
>(fn: F): F {
  return fn;
}

export function wrapCreateComponent<Options, Props, Context, Config, Result>(
  createComponent: CreateComponent<Options, Props, Context, Config>,
  wrap: (Component: VariantComponent<Options, Props, Context, Config>) => Result,
): (...args: Parameters<typeof createComponent>) => Result {
  return (...args) => wrap(createComponent(...args));
}
