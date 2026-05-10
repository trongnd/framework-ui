import { ReactUtils } from '@platform/react/utils';
import { lodash } from '@platform/utils/lodash';
import { ObjectUtils } from '@platform/utils/utils';
import type { ReactNode } from 'react';

export function getColor<T>(text: string | null, colors: T[], defaultColor?: T) {
  if (!text?.length) return defaultColor ?? colors[0];

  const value = lodash.sumBy(text, (c) => c.charCodeAt(0));

  return colors[value % colors.length] as T;
}

export function extractText(value: ReactNode) {
  return ObjectUtils.isString(value)
    ? value
    : ReactUtils.extractText(value).join(' ');
}

export function getInitials(text: string, chars = 1) {
  let parts = text.trim().split(/\s+/);

  if (chars > 1 && parts.length === 1) {
    parts = parts[0].split('');
  }

  text = parts
    .map((part) => part.replace(/[^a-z0-9]/i, '')[0]?.toUpperCase())
    .filter((part) => part)
    .slice(0, chars)
    .join('');

  return text || '';
}
