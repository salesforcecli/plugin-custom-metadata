/*
 * Copyright 2025, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
