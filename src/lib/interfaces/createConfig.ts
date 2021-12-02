/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
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
