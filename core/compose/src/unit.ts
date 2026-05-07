import { INTERNAL } from './constants';

export type Unit<Builder = any> = (this: Builder, ...args: any[]) => any;

export type UnitRecord = Record<string, UnitDescriptor>;

export type UnitDescriptor<U extends Unit = any> = {
  [INTERNAL]: { unit: U; };
};

export function createUnit<U extends Unit>(): UnitDescriptor<U> {
  return { [INTERNAL]: null as any };
}
