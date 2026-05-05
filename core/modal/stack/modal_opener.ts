import { lodash } from '@platform/utils/lodash';
import { PromiseUtils } from '@platform/utils/promise';
import type { MaybePromise } from '@platform/utils/promise';
import type { HasRequiredFields } from '@platform/utils/types';
import type { ComponentType } from 'react';
import { ModalStack } from './modal_stack';
import type { ModalInstance } from './modal_stack';

export type ModalResolver<T> = () => MaybePromise<ComponentType<T>>;

export type ModalOpenArgs<T> = undefined extends T ? Partial<[options: T]>
  : HasRequiredFields<T> extends true ? [options: T]
  : Partial<[options: T]>;

export type ModalOpener<T, Instance = T> = (
  ...args: ModalOpenArgs<T>
) => Promise<ModalInstance<Instance>>;

export type ModalOpenerOptions = {
  prepare?(): unknown;
};

export function modalOpener<T>(
  resolver: ModalResolver<T>,
  options?: ModalOpenerOptions,
): ModalOpener<T> {
  return async (...args: ModalOpenArgs<T>) => {
    await options?.prepare?.();

    return openModal(resolver, ...args);
  };
}

export async function openModal<T>(resolver: ModalResolver<T>, ...[options]: ModalOpenArgs<T>) {
  const Component = await loadModalComponent(resolver);

  return renderModal(Component, options);
}

export function renderModal<T>(Component: ComponentType<T>, ...[options]: ModalOpenArgs<T>) {
  return ModalStack.add({
    Component,
    props: (options || {}) as T,
  });
}

const F_RESOLVED = Symbol('modal:resolved');

export function loadModalComponent<T>(resolver: ModalResolver<T>) {
  const resolved = lodash.get(resolver, F_RESOLVED);
  if (resolved) return resolved;

  return PromiseUtils.run(resolver, {
    onStart() {
      ModalStack.signalComponentResolving.value += 1;
    },
    onSuccess(result) {
      lodash.set(resolver, F_RESOLVED, result);
    },
    onSettled() {
      ModalStack.signalComponentResolving.value -= 1;
    },
  });
}
