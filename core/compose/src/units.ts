import { createUseDeriveFuncUnit } from './derive';
import { createUnit } from './unit';

export const unit = {
  create: createUnit,

  use: createUseDeriveFuncUnit,

  optional<T>() {
    type UnitOptional<T> = {
      <Builder>(this: Builder, value?: T): Builder;
    };

    return createUnit<UnitOptional<T>>();
  },

  value<T>() {
    type UnitValue<T> = {
      <Builder>(this: Builder, value: T): Builder;
    };

    return createUnit<UnitValue<T>>();
  },

  values<T>() {
    type UnitValues<T> = {
      <Builder>(this: Builder, ...values: T[]): Builder;
    };

    return createUnit<UnitValues<T>>();
  },

  func<Args extends any[]>() {
    type UnitFunc<Args extends any[]> = {
      <Builder>(this: Builder, ...args: Args): Builder;
    };

    return createUnit<UnitFunc<Args>>();
  },
};
