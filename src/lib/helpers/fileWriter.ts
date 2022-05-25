/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as fs from 'fs';
import * as path from 'path';

interface FileWriterResult {
  dir: string;
  fileName: string;
  updated: boolean;
}

export class FileWriter {
  /**
   * Using the given file system, creates a file representing a new custom metadata type.
   *
   * @param fs
   * @param devname
   * @param objectXML
   */
  public async writeTypeFile(corefs = fs, dir: string, devName: string, objectXML: string): Promise<FileWriterResult> {
    let apiName = devName;
    const dirName = this.createDir(dir);

    // replace __c with __mdt
    if (apiName.endsWith('__c')) {
      apiName = apiName.replace('__c', '__mdt');
    }

    // appending __mdt if they did not pass it in.
    if (!apiName.endsWith('__mdt')) {
      apiName += '__mdt';
    }

    const outputFilePath = `${dirName}${apiName}${path.sep}`;
    const fileName = `${apiName}.object-meta.xml`;
    const updated = fs.existsSync(outputFilePath + fileName);

    await corefs.promises.mkdir(`${dirName}${apiName}`, { recursive: true });
    await corefs.promises.writeFile(outputFilePath + fileName, objectXML);

    return { dir: outputFilePath, fileName, updated };
  }

  /**
   * Using the given file system, creates a file representing a new field for the given custom metadata type
   *
   * @param fs
   * @param fieldname
   * @param fieldXML
   */
  // /fields/{fieldAPI}.field-meta.xml
  public async writeFieldFile(
    corefs = fs,
    dir: string,
    fieldName: string,
    fieldXML: string
  ): Promise<FileWriterResult> {
    const dirName = this.createDir(dir);

    // appending __c if its not already there
    if (fieldName.endsWith('__c') === false) {
      fieldName += '__c';
    }
    const outputFilePath = `${dirName}fields${path.sep}`;
    const fileName = `${fieldName}.field-meta.xml`;
    const updated = fs.existsSync(outputFilePath + fileName);
    await corefs.promises.mkdir(`${dirName}fields`, { recursive: true });
    await corefs.promises.writeFile(`${outputFilePath}${fileName}`, fieldXML);

    return { dir: outputFilePath, fileName, updated };
  }

  public createDir(dir?: string): string {
    if (dir) {
      if (dir.endsWith(path.sep)) {
        return dir;
      } else {
        return `${dir}${path.sep}`;
      }
    }
    return '';
  }
}
