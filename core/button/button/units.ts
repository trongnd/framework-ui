import type { FieldOrRef, FieldValueAny, FormDataBase } from '@platform/form/core';
import type { FieldValidatorMessage, FieldValidators, Validator } from '@platform/form/validate';
import { unit } from '@ui.core/compose';
import type { Compose } from '@ui.core/compose';
import type { TextContent } from '@ui.core/utils/text';

type UnitField<ValueBase extends FieldValueAny, DataBase extends FormDataBase> = {
  <Builder, Value extends ValueBase = ValueBase, Data extends FormDataBase = DataBase>(
    this: Builder,
    field: FieldOrRef<Value, Data>,
  ): Compose<Builder, { FieldValue: Value; FormData: Data; }>;
};

export function field<ValueBase extends FieldValueAny, DataBase extends FormDataBase = any>() {
  return unit.create<UnitField<ValueBase, DataBase>>();
}

type UnitValidate<ValueBase extends FieldValueAny, DataBase extends FormDataBase> = {
  <Builder, Value extends ValueBase = ValueBase, Data extends FormDataBase = DataBase>(
    this: Builder,
    validator: FieldValidators<Value, Data>,
  ): Compose<Builder, { FieldValue: Value; FormData: Data; }>;
};

export function validate<ValueBase extends FieldValueAny, DataBase extends FormDataBase = any>() {
  return unit.create<UnitValidate<ValueBase, DataBase>>();
}

export const visible = unit.optional<boolean>();
export const enabled = unit.optional<boolean>();
export const disabled = unit.optional<boolean>();
export const readOnly = unit.optional<boolean>();

export const label = unit.value<TextContent>();
export const placeholder = unit.value<TextContent>();
export const hint = unit.value<TextContent>();
export const hintLines = unit.value<number | boolean>();
export const error = unit.value<TextContent>();

export const required = unit.optional<boolean>();
export const requiredBoolean = unit.optional<boolean>();
export const requiredMessage = unit.value<FieldValidatorMessage>();

export const whitespace = unit.value<Validator.WhitespaceOptions>();
