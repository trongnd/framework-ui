import { unit } from '@ui.core/compose';
import { Units } from '../builder';
import { FormUnits } from '../utils/form';

export const FieldUnits = {
  use: unit.use(),
  //
  label: FormUnits.label,
  required: FormUnits.required,
  //
  labelAlias: Units.label,
  labelSuffix: Units.label,
  labelUpper: Units.enabled,
  hideLabel: Units.visible,
  placeholder: Units.placeholder,
  hint: Units.hint,
  error: Units.error,
  requiredMark: Units.visible,
  readOnly: Units.readOnly,
  disabled: Units.disabled,
};

export type DefaultAffixOptions = {
  visible?: boolean;
};

export function createFieldAffixUnits<Options>() {
  return {
    prefix: unit.value<Options>(),
    prefixes: unit.values<Options>(),
    suffix: unit.value<Options>(),
    suffixes: unit.values<Options>(),
  };
}
