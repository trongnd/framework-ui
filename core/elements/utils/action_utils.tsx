import { ArrayUtils } from '@platform/utils/utils';
import { Fragment } from 'react';
import type { ReactElement } from 'react';

export type ActionVisibleOptions = {
  visible?: boolean;
};

export type ActionAlignmentOptions = {
  left?: boolean;
  right?: boolean;
};

export function filterActions<T extends ActionVisibleOptions>(
  actions: T | null | undefined,
) {
  return ArrayUtils.toArray(actions).filter((action) => action.visible ?? true);
}

export function splitActionsByAligment<T extends ActionAlignmentOptions>(actions: T[]) {
  let leftActions: T[] = [];
  let rightActions: T[] = [];
  let centerActions: T[] = [];

  actions.forEach((action) => {
    if (action.left) {
      leftActions.push(action);
    } else if (action.right) {
      rightActions.push(action);
    } else {
      centerActions.push(action);
    }
  });

  if (!leftActions.length && !rightActions.length) {
    if (centerActions.length === 2) {
      leftActions = [centerActions[0]];
      rightActions = [centerActions[1]];
      centerActions = [];
    }
  }

  const singleAction = centerActions.length === 1 && !leftActions.length && !rightActions.length;

  return {
    leftActions,
    rightActions,
    centerActions,
    singleAction,
  };
}

export type ActionAlignmentInfo = {
  left: boolean;
  right: boolean;
  center: boolean;
  single: boolean;
};

export type RenderActionsContainer = (
  args: { content: ReactElement; },
) => ReactElement;

export type RenderActionsGroup = (
  args: { content: ReactElement; } & ActionAlignmentInfo,
) => ReactElement;

export type RenderAction<T extends ActionAlignmentOptions> = (
  args: { action: T; index: number; } & ActionAlignmentInfo,
) => ReactElement | null;

export function renderActions<T extends ActionAlignmentOptions>(
  actions: T[],
  args: {
    renderAction: RenderAction<T>;
    renderGroup: RenderActionsGroup;
    renderContainer?: RenderActionsContainer;
  },
) {
  const {
    //
    leftActions,
    rightActions,
    centerActions,
    singleAction,
  } = splitActionsByAligment(actions);

  const renderActions = (actions: T[], data: ActionAlignmentInfo) => {
    const content = actions.map((action, index) => (
      <Fragment key={index}>
        {args.renderAction({ ...data, action, index })}
      </Fragment>
    ));

    return args.renderGroup({ ...data, content: <>{content}</> });
  };

  const content = (
    <>
      {leftActions.length > 0 && (
        renderActions(leftActions, { left: true, right: false, center: false, single: false })
      )}

      {renderActions(centerActions, { left: false, right: false, center: true, single: singleAction })}

      {rightActions.length > 0 && (
        renderActions(rightActions, { left: false, right: true, center: false, single: false })
      )}
    </>
  );

  if (!args.renderContainer) return content;

  return args.renderContainer({ content });
}
