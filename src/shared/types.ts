/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import type { CustomField, CustomObject, CustomValue } from '@jsforce/jsforce-node/lib/api/metadata.js';

// I know, right?  The jsforce types aren't the best.  We expect some properties to be present that it doesn't guarantee.
// All this might improve when jsforce starts using @salesforce/schemas for its md types (and then we can drop the dependency on jsforce-node here)

export type CustomFieldWithFullNameTypeAndLabel = CustomField &
  NonNullableFields<Pick<Required<CustomField>, 'fullName' | 'type' | 'label'>>;

export type CustomObjectWithFullName = CustomObject & { fullName: string };

export type CustomValueWithFullNameAndLabel = CustomValue &
  Required<NonNullableFields<Pick<CustomValue, 'fullName' | 'label'>>>;

export const ensureFullName = (obj: CustomObject): CustomObjectWithFullName => {
  if (typeof obj.fullName === 'string') {
    return obj as CustomObjectWithFullName;
  }
  throw new Error('CustomObject must have a fullName');
};

export const customValueHasFullNameAndLabel = (cv: CustomValue): cv is CustomValueWithFullNameAndLabel =>
  typeof cv.fullName === 'string' && typeof cv.label === 'string';

/** make all fields non-nullable and required */
type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};
