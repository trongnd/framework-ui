import type { FieldControl, FieldValueAny, FieldValueOptional, FormDataBase } from '@platform/form/core';
import { useCallbackRef, useMemoizeValue } from '@platform/react/hooks';
import { useComputed, useComputedDeps } from '@platform/signal/react';
import type { MaybeArray } from '@platform/utils/types';
import { ArrayUtils } from '@platform/utils/utils';
import { formatValidationError } from './form_error';

export type FieldState<
  Value extends FieldValueAny = any,
  Data extends FormDataBase = any,
  DefaultedValue extends Value = Value,
> = ReturnType<
  typeof useFieldState<Value, Data, DefaultedValue>
>;

export function useFieldState<
  Value extends FieldValueAny = any,
  Data extends FormDataBase = any,
  DefaultedValue extends Value = Value,
>(args: {
  field: FieldControl<Value, Data>;
  getValue?(value: FieldValueOptional<Value>): DefaultedValue;
}) {
  const { field } = args;

  const valueSignal = useComputed(() => {
    let value = field.value;

    if (args.getValue) value = args.getValue(value);

    return value as DefaultedValue;
  });

  const setValue = useCallbackRef((value: Value) => {
    field.set(value);
  });

  const unsetValue = useCallbackRef(() => {
    field.unset();
  });

  const errorState = useComputedDeps(() => getErrorState({ field }), field);

  return useMemoizeValue({
    field,
    //
    valueSignal,
    setValue,
    unsetValue,
    //
    errorState,
  });
}

export type FieldStates = ReturnType<typeof useFieldStates>;

export function useFieldStates(fieldStates: MaybeArray<FieldState> | null) {
  const items = ArrayUtils.toArray(fieldStates);

  const stateSignal = useComputedDeps(() => mergeFieldStates(items), items, 'shallow');

  const setTouched = useCallbackRef((touched?: boolean) => {
    items.forEach((item) => item.field.setTouched(touched ?? true));
  });

  return useMemoizeValue({
    stateSignal,
    setTouched,
  });
}

export type MergedFieldState = ReturnType<typeof mergeFieldStates>;

export function mergeFieldStates(fieldStates: MaybeArray<FieldState> | null) {
  const items = ArrayUtils.toArray(fieldStates);

  const submitting = items.some((item) => item.field.state.submitting);
  const submitted = items.some((item) => item.field.state.submitted);
  const touched = items.some((item) => item.field.state.touched);

  const errorItem = // pick non-optional error first
    items.find(({ errorState }) => errorState.value.hasError && !errorState.value.isFormErrorOptional) ||
    items.find(({ errorState }) => errorState.value.hasError && errorState.value.isFormErrorOptional);

  const errorState = errorItem?.errorState.value ?? null;

  const error = !!errorState;
  const errorContent = errorState?.errorContent || null;
  const isFormErrorOptional = !!errorState?.isFormErrorOptional;

  return {
    submitting,
    submitted,
    touched,
    error,
    errorContent,
    isFormErrorOptional,
  };
}

export function getErrorState(args: {
  field: FieldControl<any, any>;
}) {
  const { field } = args;

  const showError = field.state.touched || field.state.submitted;

  const error = field.error;

  const label = field.getConfig((config) => config.label, null);

  const fieldError = (error && formatValidationError({ error, label })) || null;

  const errorContent = showError ? fieldError : null;
  const hasError = Boolean(errorContent?.toString());
  const isFormErrorOptional = error?.optional || false;

  return { hasError, errorContent, isFormErrorOptional };
}
