import { useTransitionState } from '@platform/react/component';
import type { TransitionDuration } from '@platform/react/component';
import { useCallbackRef, useChangesCallback } from '@platform/react/hooks';
import { useModalContext } from '../stack/modal_context';
import { ModalStack } from '../stack/modal_stack';

export type ModalTransitionOptions = {
  duration: TransitionDuration;
};

export function useModalTransition(options: ModalTransitionOptions) {
  const { modal, isCloseRequested } = useModalContext();

  const { isAnimating, isEntering, isEntered, isExiting, isExited, exit } = useTransitionState({
    duration: options.duration,
    onUnmounted() {
      ModalStack.remove(modal.uid);
    },
  });

  useChangesCallback(isCloseRequested, () => {
    if (isCloseRequested) exit();
  });

  const close = useCallbackRef(() => {
    modal.close();
  });

  return {
    close,
    isAnimating,
    isEntering,
    isEntered,
    isExiting,
    isExited,
  };
}
