import { t } from '@platform/i18n/core';
import type { MessageDescriptor, MessageParams } from '@platform/i18n/core';
import type { ReactNode } from 'react';

export type TextContent = MessageDescriptor | ReactNode;

export function textContent(
  text: TextContent,
  args?: { text?: boolean; params?: MessageParams; },
): ReactNode {
  args = args || {};

  return args.text
    ? t.try(t.text, text, args.params)
    : t.try(t.jsx, text, args.params);
}
