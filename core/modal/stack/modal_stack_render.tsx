import { createComponent } from '@platform/react/component';
import { useCallbackRef, useDidMount } from '@platform/react/hooks';
import { useComputedValue, useSignalValue } from '@platform/signal/react';
import { Fragment, Suspense, useEffect, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ModalContextProvider, useModalInstance } from './modal_context';
import { ModalStack } from './modal_stack';

export type ModalStackErrorHandler = (args: {
  error: unknown;
}) => void;

export type ModalStackRenderProps = {
  onError?: ModalStackErrorHandler;
};

export const ModalStackRender = createComponent((props: ModalStackRenderProps) => {
  const items = useSignalValue(ModalStack.signalItems);

  const onError: ModalStackErrorHandler = useCallbackRef((args) => {
    props.onError?.(args);
  });

  return (
    <Fragment key='modal_stack'>
      {items.map((item) => <ModalRender key={item.uid} item={item} onError={onError} />)}
    </Fragment>
  );
});

export function useModalStackState() {
  const isComponentResolving = useComputedValue(() => {
    return ModalStack.signalComponentResolving.value > 0;
  });

  const isSuspendLoading = useComputedValue(() => {
    return ModalStack.signalSuspendLoading.value > 0;
  });

  const isLoading = isComponentResolving || isSuspendLoading;

  return { isLoading, isComponentResolving, isSuspendLoading };
}

type ModalRenderProps = {
  item: ModalStack.Item;
  onError: ModalStackErrorHandler;
};

const ModalRender = createComponent(({ item, onError }: ModalRenderProps) => {
  const props = useComputedValue(() => ModalStack.signalProps.value[item.uid]);

  const modal = useMemo(() => ModalStack.instance(item.uid), [item.uid]);
  const isCloseRequested = useComputedValue(() => ModalStack.isCloseRequested(item.uid));

  return (
    <ModalContextProvider modal={modal} isCloseRequested={isCloseRequested}>
      <ErrorBoundary
        fallbackRender={({ error }) => <ModalErrorHandler error={error} onError={onError} />}
      >
        <Suspense fallback={<ModalSuspendLoading />}>
          <item.Component {...props} />
        </Suspense>
      </ErrorBoundary>
    </ModalContextProvider>
  );
});

type ModalErrorHandlerProps = {
  error: unknown;
  onError: ModalStackErrorHandler;
};

const ModalErrorHandler = createComponent((props: ModalErrorHandlerProps) => {
  const modal = useModalInstance();

  useDidMount(() => {
    modal.close();
    props.onError({ error: props.error });
  });

  return null;
});

const ModalSuspendLoading = createComponent(() => {
  useEffect(() => {
    ModalStack.signalSuspendLoading.value += 1;

    return () => {
      ModalStack.signalSuspendLoading.value -= 1;
    };
  }, []);

  return null;
});
