import {
  createBuilder,
  createBuilderData,
  createFinalizer,
  extendBuilder,
  getCurrentBuilderState,
} from '@ui.core/compose';
import type { Builder, BuilderData, BuilderState, FinalizerRecord, UnitRecord } from '@ui.core/compose';
import { withBuilderState } from '@ui.core/compose/src/state';
import { createContext, createElement, useContext, useMemo } from 'react';
import type { ReactElement, ReactNode } from 'react';

/* context */

const FieldBuilderContext = createContext<BuilderData | null>(null);

type FieldBuilderProviderProps = {
  state: BuilderState | null;
  children?: ReactNode;
};

function FieldBuilderProvider(props: FieldBuilderProviderProps) {
  const { state, children } = props;

  const data = useMemo(() => createBuilderData(state), [state]);

  return createElement(FieldBuilderContext.Provider, { value: data }, children);
}

/* render */

export type FieldRenderer = () => ReactElement;

export function createFieldRender(render: FieldRenderer) {
  return render;
}

type FieldRenderWrapperFn = (args: { content: ReactElement; }) => ReactElement;

export function fieldRenderWrapper(
  fn: FieldRenderWrapperFn,
) {
  return fn;
}

export function createFieldRenderWrapper(
  fn: FieldRenderWrapperFn,
) {
  return (render: FieldRenderer) => applyFieldRenderWrapper(fn, render);
}

export function applyFieldRenderWrapper(
  fn: FieldRenderWrapperFn,
  render: FieldRenderer,
) {
  return createFieldRender(() => fn({ content: render() }));
}

/* builder */

function createFielRenderFinalizer(render: FieldRenderer) {
  function RenderContent(props: { state: BuilderState; render: FieldRenderer; }) {
    const { state, render } = props;

    return withBuilderState(state, () => render());
  }

  return createFinalizer((customRender?: FieldRenderer) => {
    const state = getCurrentBuilderState();

    return createElement(
      FieldBuilderProvider,
      { state },
      state && createElement(RenderContent, {
        state,
        render: customRender || render,
      }),
    );
  });
}

export function createFieldBuilder<Units extends UnitRecord>(
  units: Units,
  render: FieldRenderer,
) {
  return createBuilder(units, {
    finalizers: { render: createFielRenderFinalizer(render) },
  });
}

export function extendFieldBuilder<Units extends UnitRecord, Finalizers extends FinalizerRecord>(
  builder: Builder<Units, Finalizers>,
  args: { render: FieldRenderer; },
) {
  return extendBuilder(builder, {
    finalizers: { render: args.render },
  });
}

export function useFieldBuilder<Units extends UnitRecord>(units: Units) {
  const data = useContext(FieldBuilderContext);

  if (!data) {
    throw new Error('useFieldBuilder: builder not provided');
  }

  const filteredData: typeof data = {};

  Object.keys(units).forEach((key) => {
    filteredData[key] = data[key];
  });

  return { data: data as BuilderData<Units> };
}
