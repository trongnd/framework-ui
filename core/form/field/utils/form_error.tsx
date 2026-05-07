import type { FieldControlError, FieldControlLabel } from '@platform/form/core';
import { t } from '@platform/i18n/core';

export function formatValidationError(options: {
  label: FieldControlLabel;
  error: FieldControlError | null;
}) {
  const { label, error } = options;

  const params = {
    label: <>{t.try(t.jsx, label)}</>,
  };

  return t.try(t.jsx, error?.message, params) || null;
}
