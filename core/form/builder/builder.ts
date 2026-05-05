import { createBuilder, createBuilderData, createFinalizer, getCurrentBuilderState } from '@ui.core/compose';
import type { BuilderData, BuilderState, UnitRecord } from '@ui.core/compose';
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
  function RenderContent() {
    return render();
  }

  return createFinalizer(() => {
    const state = getCurrentBuilderState();

    return createElement(
      FieldBuilderProvider,
      { state },
      createElement(RenderContent),
    );
  });
}

/* builder */

export function createFieldBuilder<Units extends UnitRecord>(
  units: Units,
  render: FieldRenderer,
) {
  return createBuilder(units, { finalizer: { render } });
}

// oxlint-disable-next-line no-unused-vars
export function useFieldBuilder<Units extends UnitRecord>(units: Units) {
  const data = useContext(FieldBuilderContext);

  if (!data) {
    throw new Error('useFieldBuilder: builder not provided');
  }

  return { data: data as BuilderData<Units> };
}
