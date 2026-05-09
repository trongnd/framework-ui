import { isMessageDescriptor, t } from '@platform/i18n/core';
import type { MessageDescriptor, MessageParams } from '@platform/i18n/core';
import { isValidElement } from 'react';
import type { ReactElement } from 'react';

export type TextContentPrimitive = ReactElement | string | number | null | undefined;
export type TextContent = MessageDescriptor | TextContentPrimitive;

export function isTextContent(value: unknown): value is TextContent {
  return (
    value === null ||
    value === undefined ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    isMessageDescriptor(value) ||
    isValidElement(value)
  );
}

export function textContent(
  text: TextContent,
  args?: { text?: boolean; params?: MessageParams; },
): TextContentPrimitive {
  args = args || {};

  return args.text
    ? t.try(t.text, text, args.params)
    : t.try(t.jsx, text, args.params);
}
