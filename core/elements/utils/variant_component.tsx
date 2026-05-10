import { createComponent } from '@platform/react/component';
import type { MaybePartialArgs, OmitProps, Type } from '@platform/utils/types';
import type { ReactElement } from 'react';

export type ComponentVariantContext<Context, Config> = Context & {
  config: Config;
  applyVariant(variant: ComponentVariant<Context, Config>): Config | void;
};

export type ComponentVariant<Context, Config> = {
  (context: ComponentVariantContext<Context, Config>): Config | void;
};

type ComponentRenderArgs<Options, Props> = {
  options: Options;
  props: Props;
};

type ComponentRender<Options, Props> = (
  args: ComponentRenderArgs<Options, Props>,
) => ReactElement | null;

type CreateComponentOptions<Options, ComponentProps> = Options & {
  componentProps?: Type<ComponentProps>;
};

export function createVariantComponent<Options, Props, Context, Config>(_args: {
  factoryOptions: Type<Options>;
  componentProps: Type<Props>;
  variantContext: Type<Context>;
  variantConfig: Type<Config>;
}) {
  let componentRender: ComponentRender<Options, Props> = () => null;

  const create = <ComponentProps,>(
    ...args: MaybePartialArgs<CreateComponentOptions<Options, ComponentProps>>
  ) => {
    const options = (args[0] || {}) as Options;

    return createComponent(function VariantComponent(props: Props & ComponentProps) {
      return componentRender({ options, props });
    });
  };

  const createVariant = (variant: ComponentVariant<Context, Config>) => {
    return variant;
  };

  const render = (render: ComponentRender<Options, Props>) => {
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
