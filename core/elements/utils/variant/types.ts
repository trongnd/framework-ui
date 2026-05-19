import type { MaybePartialArgs, Type } from '@platform/utils/types';
import type { ComponentType, ForwardedRef, ReactElement } from 'react';
import type { DefineConfig, DefineConfigFn, VariantConfig } from './config';
import type { VARIANT } from './utils';

export type AnyDefineFn = DefineFn<any, any, any, any>;
export type AnyRenderFn = RenderFn<any, any, any, any>;
export type AnyProps = VariantComponentProps<any, any, any, any>;
export type AnyComponent = VariantComponent<any, any, any, any>;
export type AnyVariantFn = VariantFn<any, any, {}, any>;
export type AnyVariant = Variant<any, any, {}, any>;

export type VariantFnArgs<Options, Props, Context, Config> = Context & {
  options: Options;
  props: Props;
  config: VariantConfig<Config>;
  applyVariant(variant: Variant<Options, Props, Context, Config>): void;
  setOptions(options: Partial<Options>): void;
  setProps(props: Partial<Props>): void;
};

export type VariantFn<Options, Props, Context, Config> = {
  (args: VariantFnArgs<Options, Props, Context, Config>): void;
};

export type Variant<Options, Props, Context, Config> = VariantFn<Options, Props, Context, Config> & {
  [VARIANT]: true;
};

export type VariantProp<Options, Props, Context, Config> =
  | Variant<Options, Props, Context, Config>
  | (() => Variant<Options, Props, Context, Config>)
  | null
  | undefined;

export type VariantComponentProps<Options, Props, Context, Config> = Props & {
  variant?: VariantProp<Options, Props, Context, Config>;
};

export type VariantComponent<Options, Props, Context, Config> = ComponentType<
  VariantComponentProps<Options, Props, Context, Config>
>;

export type CreateComponent<Options, Props, Context, Config> = {
  (fn: VariantFn<Options, Props, Context, Config>): VariantComponent<Options, Props, Context, Config>;
};

export type CreateVariant<Options, Props, Context, Config> = {
  (
    fn: VariantFn<Options, Props, Context, Config>,
  ): Variant<Options, Props, Context, Config>;

  <Params extends object>(
    params: Params | Type<Params>,
    fn: VariantFn<Options, Props & Params, Context, Config>,
  ): (...args: MaybePartialArgs<Params>) => Variant<Options, Props & Params, Context, Config>;
};

export type CreateVariantFactory<Options, Props, Context, Config> = {
  (fn: VariantFn<Options, Props, Context, Config>): Variant<Options, Props, Context, Config>;
};

export type SetDefaultVariant<Options, Props, Context, Config> = {
  (fn: VariantFn<Options, Props, Context, Config>): void;
  (fn: Variant<Options, Props, Context, Config>): void;
  (fn: null): void;
};

export type SetDefaultProps<Options, Props, Context, Config> = {
  (props: Partial<VariantComponentProps<Options, Props, Context, Config>>): void;
  (props: null): void;
};

export type RenderArgs<Options, Props, Context, Config> = {
  options: Options;
  props: VariantComponentProps<Options, Props, Context, Config>;
  component: VariantComponent<Options, Props, Context, Config>;
  forwardedRef: ForwardedRef<unknown>;
};

export type RenderFn<Options, Props, Context, Config> = {
  (args: RenderArgs<Options, Props, Context, Config>): ReactElement | null;
};

export type DefineArgs<Options, Props, Context, ConfigFn extends DefineConfigFn> = {
  options: Options;
  config: ConfigFn;
  props: Type<Props>;
  context: Type<Context>;
};

export type DefineFn<Options, Props, Context, ConfigFn extends DefineConfigFn> = {
  (...args: any[]): DefineArgs<Options, Props, Context, ConfigFn>;
};

export type DefineVariant<T extends AnyDefineFn> = T extends
  DefineFn<infer Options, infer Props, infer Context, infer ConfigFn>
  ? Variant<Options, Props, Context, DefineConfig<ConfigFn>>
  : unknown;
