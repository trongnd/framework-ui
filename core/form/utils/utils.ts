import type { MaybeArray } from '@platform/utils/types';
import { ArrayUtils, ObjectUtils, StringUtils } from '@platform/utils/utils';
import { textContent } from '@ui.core/utils/text';
import type { TextContent } from '@ui.core/utils/text';
import type { DefaultAffixOptions } from '../field';

export function getPlaceholderText(placeholder: TextContent | null | undefined) {
  placeholder = textContent(placeholder, { text: true });

  return ObjectUtils.isString(placeholder) ? StringUtils.trim(placeholder) : undefined;
}

export function filterAffixes<T extends DefaultAffixOptions>(...affixes: MaybeArray<T | null | undefined>[]) {
  return ArrayUtils.compact(affixes.flat()).filter((item) => item?.visible ?? true);
}
