import type { AnyComponent, AnyDefineFn, AnyProps, AnyRenderFn, AnyVariant } from './types';

const RENDER_FNS = new WeakMap<AnyDefineFn, AnyRenderFn>();
const DEFAULT_VARIANTS = new WeakMap<AnyComponent, AnyVariant>();
const DEFAULT_PROPS = new WeakMap<AnyComponent, AnyProps>();

export const Registry = {
  getRenderFn,
  setRenderFn,
  getDefaultVariant,
  setDefaultVariant,
  getDefaultProps,
  setDefaultProps,
};

function getRenderFn(define: AnyDefineFn) {
  return RENDER_FNS.get(define) ?? null;
}

function setRenderFn(define: AnyDefineFn, fn: AnyRenderFn | null) {
  if (fn) {
    RENDER_FNS.set(define, fn);
  } else {
    RENDER_FNS.delete(define);
  }
}

function getDefaultVariant(component: AnyComponent) {
  return DEFAULT_VARIANTS.get(component) ?? null;
}

function setDefaultVariant(component: AnyComponent, variant: AnyVariant | null) {
  if (variant) {
    DEFAULT_VARIANTS.set(component, variant);
  } else {
    DEFAULT_VARIANTS.delete(component);
  }
}

function getDefaultProps(component: AnyComponent) {
  return DEFAULT_PROPS.get(component) ?? null;
}

function setDefaultProps(component: AnyComponent, props: AnyProps | null) {
  if (props) {
    const defaultProps = DEFAULT_PROPS.get(component);

    DEFAULT_PROPS.set(component, { ...defaultProps, ...props });
  } else {
    DEFAULT_PROPS.delete(component);
  }
}
