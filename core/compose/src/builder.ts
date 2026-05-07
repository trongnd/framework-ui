import type { BuilderDescriptor, BuilderMetadata, FinalizerRecord } from './compose';
import { INTERNAL } from './constants';
import { applyDeriveUnitFromMetadata, getUnitDeriveMetadata } from './derive';
import { applyBuilderStateMethod, assignBuilderMappings, withBuilderState } from './state';
import type { BuilderState, BuilderStateMappings, BuilderStateMethods } from './state';

export function createBuilderInternal<Builder>(
  descriptor: BuilderDescriptor,
  finalizers: FinalizerRecord,
) {
  const builder = () => {
    const state: BuilderState = {};

    const methods: BuilderStateMethods = {};
    const mappings: BuilderStateMappings = {};

    for (const field of descriptor.fields) {
      const mapping = { stateKey: field };

      const unit = descriptor.units[field];
      const deriveUnit = unit ? getUnitDeriveMetadata(unit) : null;

      const fn = (...args: unknown[]) => {
        applyBuilderStateMethod(state, field, args);

        if (deriveUnit) {
          withBuilderState(state, () => applyDeriveUnitFromMetadata(deriveUnit, args));
        }

        return methods;
      };

      mappings[field] = mapping;
      methods[field] = fn;
    }

    assignBuilderMappings(state, mappings);

    if (finalizers) {
      for (const key of Object.keys(finalizers)) {
        const finalizer = finalizers[key];

        methods[key] = (...args: any[]) => {
          return withBuilderState(state, () => finalizer(...args));
        };
      }
    }

    return methods as Builder;
  };

  const metadata: BuilderMetadata = {
    units: descriptor.units,
    finalizers: finalizers,
  };

  Object.assign(builder, {
    [INTERNAL]: metadata,
  });

  return builder;
}
