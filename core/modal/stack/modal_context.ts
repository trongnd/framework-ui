import { createContextProvider, createUseContext, createUseContextOptional } from '@platform/react/context';
import { useChangesCallback } from '@platform/react/hooks';
import { createContext } from 'react';
import type { ModalInstance } from './modal_stack';

export type ModalContext<T = any> = {
  modal: ModalInstance<T>;
  isCloseRequested: boolean;
};

const Context = createContext<ModalContext | null>(null);

export const ModalContextProvider = createContextProvider(Context);

export const useModalContext = createUseContext(Context);
export const useModalContextOptional = createUseContextOptional(Context);

export const useModalInstance = () => useModalContext().modal;
export const useModalInstanceOptional = () => useModalContextOptional()?.modal ?? null;

export function useHandleModalCloseRequested(callback?: () => void) {
  const { modal, isCloseRequested } = useModalContext();

  useChangesCallback(isCloseRequested, () => {
    if (!isCloseRequested) return;

    if (callback) {
      callback();
    } else {
      modal.remove();
    }
  });
}
