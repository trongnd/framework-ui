import { useFieldOrRef } from '@platform/form/react';
import { Validator } from '@platform/form/validate';
import type { BuilderData } from '@ui.core/compose';
import { useFieldState, useValidateHandler } from '../utils/form';
import type { TextInputFormUnits } from './units';

export function useTextInputHandler(args: {
  data: BuilderData<typeof TextInputFormUnits>;
}) {
  const { data } = args;

  const field = useFieldOrRef(data.field.get());

  const whitespace = data.whitespace.get();

  useValidateHandler({
    field,
    data,
    validators: data.validate.list(),
    extraValidators: [
      whitespace && Validator.whitespace(whitespace),
    ],
  });

  const fieldState = useFieldState({
    field,
    getValue: (value) => value?.toString() ?? '',
  });

  return fieldState;
}
