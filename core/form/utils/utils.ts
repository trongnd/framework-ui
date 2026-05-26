import type { MaybeArray } from '@platform/utils/types';
import { ArrayUtils } from '@platform/utils/utils';
import type { DefaultAffixOptions } from '../field';

export function filterAffixes<T extends DefaultAffixOptions>(...affixes: MaybeArray<T | null | undefined>[]) {
  return ArrayUtils.compact(affixes.flat()).filter((item) => item?.visible ?? true);
}
