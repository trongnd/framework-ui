import type { FieldControl, FieldValueAny, FieldValueOptional, FormDataBase } from '@platform/form/core';
import { useSetFieldConfig, useSetFieldValidators, useValidateField } from '@platform/form/validate';
import type { FieldValidatorMessage, FieldValidators } from '@platform/form/validate';
import { useCallbackRef, useMemoizeValue } from '@platform/react/hooks';
import { useComputed } from '@platform/signal/react';
import type { BuilderData } from '@ui.core/compose';
import type { TextContent } from '@ui.core/utils/text';
import { Units } from '../builder';

export const FormUnits = {
  label: Units.label,
  required: Units.required,
  requiredBoolean: Units.requiredBoolean,
  requiredMessage: Units.requiredMessage,
};

export function useValidateHandler<
  V extends FieldValueAny,
  D extends FormDataBase = any,
>(args: {
  field: FieldControl<V, D>;
  data: BuilderData<typeof FormUnits> | null;
  //
  validators: FieldValidators<V>[];
  extraValidators?: FieldValidators<V>;
  //
  label?: TextContent;
  required?: boolean | null;
  requiredBoolean?: boolean | null;
  requiredMessage?: FieldValidatorMessage | null;
}) {
  const { field, data, extraValidators } = args;

  const label = args.label ?? data?.label.get() ?? null;
  const required = args.required ?? data?.required.defaulted(true, false) ?? false;
  const requiredBoolean = args.requiredBoolean ?? data?.requiredBoolean.defaulted(true, false) ?? false;
  const requiredMessage = args.requiredMessage ?? data?.requiredMessage.get() ?? null;

  const validators = args.validators.flat(1);

  useSetFieldConfig(field, {
    label,
    requiredMessage,
  });

  useSetFieldValidators(field, {
    required,
    requiredBoolean,
    componentProps: validators,
    componentOwn: extraValidators,
  });

  useValidateField(field);
}

export function useFieldState<
  Value extends FieldValueAny,
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

  return useMemoizeValue({
    valueSignal,
    setValue,
    unsetValue,
  });
}
