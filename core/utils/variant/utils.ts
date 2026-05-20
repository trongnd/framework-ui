import type { AnyVariant, Variant } from './types';

export const VARIANT = Symbol('variant');
export const VARIANT_DEFAULT_PARAMS = Symbol('variant:default_params');

export function isVariant<Options, Props, Context, Config>(
  variant: unknown,
): variant is Variant<Options, Props, Context, Config> {
  return Boolean(variant) && (variant as AnyVariant)[VARIANT] === true;
}
