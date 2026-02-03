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

import fs from 'node:fs';
import path from 'node:path';

type FileWriterResult = {
  dir: string;
  fileName: string;
  updated: boolean;
};

/**
 * Using the given file system, creates a file representing a new custom metadata type.
 *
 * @param fs
 * @param devname
 * @param objectXML
 */
export const writeTypeFile = async (
  corefs = fs,
  dir: string,
  devName: string,
  objectXML: string
): Promise<FileWriterResult> => {
  let apiName = devName;

  // replace __c with __mdt
  if (apiName.endsWith('__c')) {
    apiName = apiName.replace('__c', '__mdt');
  }

  // appending __mdt if they did not pass it in.
  if (!apiName.endsWith('__mdt')) {
    apiName += '__mdt';
  }

  const outputFilePath = path.join(removeTrailingSlash(dir), apiName);
  const fileName = `${apiName}.object-meta.xml`;
  const updated = fs.existsSync(path.join(outputFilePath, fileName));

  await corefs.promises.mkdir(outputFilePath, { recursive: true });
  await corefs.promises.writeFile(path.join(outputFilePath, fileName), objectXML);

  return { dir: outputFilePath, fileName, updated };
};

/**
 * Using the given file system, creates a file representing a new field for the given custom metadata type
 *
 * @param fs
 * @param fieldname
 * @param fieldXML
 */
// /fields/{fieldAPI}.field-meta.xml
export const writeFieldFile = async (
  corefs = fs,
  dir: string,
  fieldName: string,
  fieldXML: string
): Promise<FileWriterResult> => {
  const outputFilePath = path.join(removeTrailingSlash(dir), 'fields');
  const fileName = `${ensureDoubleUnderscoreC(fieldName)}.field-meta.xml`;
  const updated = fs.existsSync(path.join(outputFilePath, fileName));
  await corefs.promises.mkdir(outputFilePath, { recursive: true });
  await corefs.promises.writeFile(path.join(outputFilePath, fileName), fieldXML);

  return { dir: outputFilePath, fileName, updated };
};

const removeTrailingSlash = (dir: string): string => dir.replace(/\/+$/, '');
const ensureDoubleUnderscoreC = (name: string): string => (name.endsWith('__c') ? name : `${name}__c`);
