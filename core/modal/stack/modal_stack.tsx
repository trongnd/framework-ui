import { batch, signal } from '@platform/signal/core';
import { lodash } from '@platform/utils/lodash';
import type { ComponentType } from 'react';

export namespace ModalStack {
  export type Item<T = any> = {
    uid: string;
    Component: ComponentType<T>;
    //
    closeRequested: boolean;
  };

  export type Props = Record<string, any>;

  export const signalItems = signal<Item[]>([]);
  export const signalProps = signal<Props>({});

  export const signalComponentResolving = signal(0);
  export const signalSuspendLoading = signal(0);

  let uidCounter = 0;

  export type AddOptions<T> = {
    Component: ComponentType<T>;
    props: T;
  };

  export function add<T = {}>(options: AddOptions<T>) {
    const item: Item<T> = {
      uid: 'modal:' + (uidCounter++).toString(),
      //
      Component: options.Component,
      closeRequested: false,
    };

    const items = signalItems.value.concat(item);

    batch(() => {
      setProps(item.uid, options.props);
      signalItems.value = items;
    });

    return instance<T>(item.uid);
  }

  export function setProps(uid: string, props: any) {
    signalProps.value = {
      ...signalProps.peek(),
      [uid]: props,
    };
  }

  export function close(uid: string) {
    const items = signalItems.value.map(
      (item): Item => ({
        ...item,
        closeRequested: item.closeRequested || item.uid === uid,
      }),
    );

    signalItems.value = items;
  }

  export function remove(uid: string) {
    const items = signalItems.value.filter((item) => item.uid !== uid);

    const props = lodash.omit(signalProps.value, [uid]);

    batch(() => {
      signalProps.value = props;
      signalItems.value = items;
    });
  }

  export function clear() {
    let items = signalItems.peek();

    if (!items.length) return;

    items = items.map((item): Item => ({ ...item, closeRequested: true }));

    signalItems.value = items;
  }

  export function instance<T = any>(uid: string) {
    return new ModalInstance<T>(uid);
  }

  export function getItem(uid: string) {
    return signalItems.value.find((item) => item.uid === uid) || null;
  }

  export function getIndex(uid: string) {
    return signalItems.value.findIndex((item) => item.uid === uid);
  }

  export function isCloseRequested(uid: string) {
    const item = getItem(uid);

    return item ? item.closeRequested : true;
  }
}

export class ModalInstance<T = any> {
  constructor(private readonly _uid: string) {}

  get index() {
    return Math.max(0, ModalStack.getIndex(this._uid));
  }

  get uid() {
    return this._uid;
  }

  close = () => {
    ModalStack.close(this._uid);
  };

  remove = () => {
    ModalStack.remove(this._uid);
  };

  setProps = (props: T) => {
    ModalStack.setProps(this._uid, props);
  };
}
