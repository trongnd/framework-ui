import type { AnyVariant, AnyVariantFn, CreateVariant, ExtendVariant } from './types';
import { isVariant, VARIANT, VARIANT_DEFAULT_PARAMS } from './utils';

export const _createVariant: CreateVariant<any, any, {}, any> = (...args: any[]): any => {
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

  const factory = (params: object) =>
    toVariant((args) => {
      const props = {
        ...defaultParams,
        ...args.props,
        ...params,
      };

      return fn({ ...args, props });
    });

  Object.assign(factory, {
    [VARIANT_DEFAULT_PARAMS]: defaultParams,
  });

  return factory;
};

export const _extendAnyVariant: ExtendVariant = (variant: unknown, fn: AnyVariantFn): any => {
  if (isVariant(variant)) {
    return _createVariant((args) => {
      variant(args);
      fn(args);
    });
  }

  const factory = variant as (params: object) => AnyVariant;
  const defaultParams = (factory as any)[VARIANT_DEFAULT_PARAMS] ?? null;

  return (params: object) => {
    return _createVariant((args) => {
      const props = {
        ...defaultParams,
        ...args.props,
        ...params,
      };

      factory(params)(args);
      fn({ ...args, props });
    });
  };
};
