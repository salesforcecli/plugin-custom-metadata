/*
 * Copyright 2026, Salesforce, Inc.
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

import type { Record } from '@jsforce/jsforce-node';
import type { CustomField } from '@jsforce/jsforce-node/lib/api/metadata.js';
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
