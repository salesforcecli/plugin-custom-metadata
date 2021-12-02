/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as fs from 'fs';

export class FileWriter {
  /**
   * Using the given file system, creates a file representing a new custom metadata type.
   *
   * @param fs
   * @param devname
   * @param objectXML
   */
  public async writeTypeFile(
    corefs,
    dir: string,
    devName: string,
    objectXML: string
  ) {
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

    const outputFilePath = `${dirName}${apiName}/`;
    const fileName = `${apiName}.object-meta.xml`;
    const updated = fs.existsSync(outputFilePath + fileName);

    await corefs.mkdirp(`${dirName}${apiName}`);
    await corefs.writeFile(outputFilePath + fileName, objectXML);

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
  public async writeFieldFile(corefs, dir, fieldName, fieldXML) {
    const dirName = this.createDir(dir);

    // appending __c if its not already there
    if (fieldName.endsWith('__c') === false) {
      fieldName += '__c';
    }
    const outputFilePath = `${dirName}fields/`;
    const fileName = `${fieldName}.field-meta.xml`;
    const updated = fs.existsSync(outputFilePath + fileName);
    await corefs.mkdirp(`${dirName}fields`);
    await corefs.writeFile(outputFilePath + fileName, fieldXML);

    return { dir: outputFilePath, fileName, updated };
  }

  public createDir(dir) {
    if (dir) {
      if (dir.endsWith('/')) {
        return dir;
      } else {
        return dir + '/';
      }
    }
    return '';
  }
}
