import { createComponent } from '@platform/react/component';
import type { ForwardedRef } from 'react';
import type { DefineConfig, DefineConfigFn } from './config';
import { Registry } from './registry';
import type { DefineFn, VariantComponent, VariantComponentProps } from './types';

type ComponentRenderProps<Options, Props, Context, ConfigFn extends DefineConfigFn> = {
  define: DefineFn<Options, Props, Context, ConfigFn>;
  options: Options;
  props: VariantComponentProps<Options, Props, Context, DefineConfig<ConfigFn>>;
  component: VariantComponent<Options, Props, Context, DefineConfig<ConfigFn>>;
  forwardedRef: ForwardedRef<unknown>;
};

export const ComponentRender = createComponent(<Options, Props, Context, ConfigFn extends DefineConfigFn>(
  componentRenderProps: ComponentRenderProps<Options, Props, Context, ConfigFn>,
) => {
  const {
    define,
    options,
    component,
    forwardedRef,
  } = componentRenderProps;

  const fnRender = Registry.getRenderFn(define);
  if (!fnRender) return null;

  const props = {
    ...Registry.getDefaultProps(component),
    ...componentRenderProps.props,
  };

  return fnRender({
    options,
    props,
    component,
    forwardedRef,
  });
});
