import { forwardRef } from 'react';
import type { DefineConfig, DefineConfigFn } from './config';
import { Registry } from './registry';
import { ComponentRender } from './render';
import type {
  AnyVariant,
  CreateComponent,
  CreateVariant,
  DefineArgs,
  DefineFn,
  ExtendVariant,
  RenderFn,
  SetDefaultProps,
  SetDefaultVariant,
  Variant,
  VariantComponent,
  VariantComponentProps,
  VariantFn,
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

    const result = createVariantComponent(define, { options });

    result.setDefaultVariant(variant);

    result.setDefaultProps(Registry.getDefaultProps(Component));

    return result.Component;
  };

  const createVariant: CreateVariant<Options, Props, Context, Config> = (fn) => {
    return toVariant(fn);
  };

  const extendVariant: ExtendVariant = (variant, fn) => {
    return toVariant((args) => {
      variant(args);
      fn(args);
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
    extendVariant,
    setDefaultVariant,
    setDefaultProps,
  };
}

function toVariant<Options, Props, Context, Config>(fn: VariantFn<Options, Props, Context, Config>) {
  const variant: Variant<Options, Props, Context, Config> = function Variant(args) {
    fn(args);
  };

  variant[VARIANT] = true;

  return variant;
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
