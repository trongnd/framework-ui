import { Units } from '../builder';

export type TextInputValue = string | number | null | undefined;

export const DefaultTextInputUnits = {
  field: Units.field<TextInputValue>(),
};
