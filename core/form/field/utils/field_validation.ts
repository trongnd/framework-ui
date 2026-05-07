import type { FieldControl, FieldValueAny, FormDataBase } from '@platform/form/core';
import { useSetFieldConfig, useSetFieldValidators, useValidateField } from '@platform/form/validate';
import type { FieldValidatorMessage, FieldValidators } from '@platform/form/validate';
import type { BuilderData } from '@ui.core/compose';
import type { TextContent } from '@ui.core/utils/text';
import type { FormUnits } from '../units';

export function useFieldValidation<
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
