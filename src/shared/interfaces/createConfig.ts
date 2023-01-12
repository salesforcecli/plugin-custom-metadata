/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Record } from 'jsforce';
import { CustomField } from 'jsforce/api/metadata';
export type CreateConfig = {
  typename: string;
  recordname: string;
  label: string;
  inputdir: string;
  outputdir: string;
  protected?: boolean;
  varargs?: Record;
  fileData?: CustomField[];
  ignorefields?: boolean;
};

export type CreateConfigs = CreateConfig[];
