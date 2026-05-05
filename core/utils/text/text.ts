import { t } from '@platform/i18n/core';
import type { MessageDescriptor } from '@platform/i18n/core';
import type { ReactNode } from 'react';

export type TextContent = MessageDescriptor | ReactNode;

export function textContent(text: TextContent, asText = false): ReactNode {
  return asText ? t.try(t.text, text) : t.try(t.jsx, text);
}
