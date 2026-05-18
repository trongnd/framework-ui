import type { MaybePartialArgs, OmitProps, Type } from '@platform/utils/types';
import { forwardRef } from 'react';
import type { ForwardedRef, ReactElement } from 'react';

export type ComponentVariantContext<Context, Config> = Context & {
  config: Config;
  applyVariant(variant: ComponentVariant<Context, Config>): Config | void;
};

export type ComponentVariant<Context, Config> = {
  (context: ComponentVariantContext<Context, Config>): Config | void;
};

export type ComponentRenderArgs<Options, Props, Ref> = {
  options: Options;
  props: Props;
  ref: ForwardedRef<Ref>;
};

type ComponentRender<Options, Props, Ref> = (
  args: ComponentRenderArgs<Options, Props, Ref>,
) => ReactElement | null;

export type CreateComponentOptions<Options, ComponentProps> = Options & {
  componentProps?: Type<ComponentProps>;
};

export function createVariantComponent<Options, Props, Context, Config, Ref = unknown>(_args: {
  factoryOptions: Type<Options>;
  componentProps: Type<Props>;
  componentRef?: Type<Ref>;
  variantContext: Type<Context>;
  variantConfig: Type<Config>;
}) {
  let componentRender: ComponentRender<Options, Props, Ref> = () => null;

  const create = <ComponentProps,>(
    ...args: MaybePartialArgs<CreateComponentOptions<Options, ComponentProps>>
  ) => {
    const options = (args[0] || {}) as Options;

    return forwardRef<Ref, Props & ComponentProps>(function VariantComponent(props, ref) {
      return componentRender({
        options,
        props: props as Props,
        ref,
      });
    });
  };

  const createVariant = (variant: ComponentVariant<Context, Config>) => {
    return variant;
  };

  const render = (render: ComponentRender<Options, Props, Ref>) => {
    componentRender = render;
  };

  return {
    createComponent: create,
    createVariant,
    render,
  };
}

type ApplyVariantContext<Context, Config> = OmitProps<
  ComponentVariantContext<Context, Config>,
  'config' | 'applyVariant'
>;

export function applyComponentVariant<Context, Config>(
  variant: ComponentVariant<Context, Config> | null | undefined,
  context: ApplyVariantContext<Context, Config>,
  config?: Config,
) {
  const variantConfig = (config || {}) as Config;

  const variantContext: ComponentVariantContext<unknown, Config> = {
    ...context,
    config: variantConfig,
    applyVariant(variant) {
      applyComponentVariant(variant, variantContext, variantConfig);
    },
  };

  const returnedConfig = variant?.(variantContext as any);

  return { ...variantConfig, ...returnedConfig } as Config;
}
