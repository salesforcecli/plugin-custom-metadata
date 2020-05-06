/*
 * Copyright (c) 2018-2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { CustomField } from './customField';

export interface CreateConfig {
  typename: string;
  recordname: string;
  label: string;
  inputdir: string;
  outputdir: string;
  protected?: boolean;
  varargs?: object;
  fileData?: CustomField[];
  ignorefields?: boolean;
}
