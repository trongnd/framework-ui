import type { FieldOrRef, FieldValueAny, FormDataBase } from '@platform/form/core';
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
  return unit<UnitField<ValueBase, DataBase>>();
}

export const visible = unit.optional<boolean>();

export const label = unit.value<TextContent>();
export const placeholder = unit.value<TextContent>();
export const hint = unit.value<TextContent>();
export const error = unit.value<TextContent>();
