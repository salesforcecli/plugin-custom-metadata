/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import fs from 'node:fs';
import path from 'node:path';

type FileWriterResult = {
  dir: string;
  fileName: string;
  updated: boolean;
}

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
  fieldName: string | undefined | null,
  fieldXML: string
): Promise<FileWriterResult> => {
  // appending __c if its not already there
  if (fieldName?.endsWith('__c') === false) {
    fieldName += '__c';
  }
  const outputFilePath = path.join(removeTrailingSlash(dir), 'fields');
  const fileName = `${fieldName}.field-meta.xml`;
  const updated = fs.existsSync(path.join(outputFilePath, fileName));
  await corefs.promises.mkdir(outputFilePath, { recursive: true });
  await corefs.promises.writeFile(path.join(outputFilePath, fileName), fieldXML);

  return { dir: outputFilePath, fileName, updated };
};

const removeTrailingSlash = (dir: string): string => dir.replace(/\/+$/, '');
