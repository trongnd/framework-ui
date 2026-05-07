import { Units } from '../builder';
import { FormUnits } from '../utils/form';

export type TextInputValue = string | number | null | undefined;

export const TextInputFormUnits = {
  ...FormUnits,
  field: Units.field<TextInputValue>(),
  validate: Units.validate<TextInputValue>(),
  whitespace: Units.whitespace,
};

export const TextInputUnits = {
  ...TextInputFormUnits,
};
