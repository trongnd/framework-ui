import { isMessageDescriptor, t } from '@platform/i18n/core';
import type { MessageDescriptor, MessageParams } from '@platform/i18n/core';
import { isValidElement } from 'react';
import type { ReactElement } from 'react';

export type TextContentPrimitive = ReactElement | string | number;
export type TextContent = MessageDescriptor | TextContentPrimitive;

export function isTextContent(value: unknown): value is TextContent {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    isMessageDescriptor(value) ||
    isValidElement(value)
  );
}

export function textContent(
  text: TextContent | null | undefined,
  args?: { text?: boolean; params?: MessageParams; },
): TextContentPrimitive | null {
  if (text === null || text === undefined) return null;

  args = args || {};

  return args.text
    ? t.try(t.text, text, args.params)
    : t.try(t.jsx, text, args.params);
}
