/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'fs';
import * as path from 'path';
import { Flags, loglevel, SfCommand } from '@salesforce/sf-plugins-core';
import { Messages, SfError } from '@salesforce/core';
import { Record } from 'jsforce';
import * as csv from '../../../../../csvtojson';
import { CreateUtil, getFieldNames, appendDirectorySuffix } from '../../../../lib/helpers/createUtil';
import { CreateConfig } from '../../../../lib/interfaces/createConfig';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-custom-metadata', 'insertRecord');

export default class Insert extends SfCommand<CreateConfig[]> {
  public static readonly summary = messages.getMessage('commandDescription');
  public static readonly description = messages.getMessage('commandLongDescription');
  public static readonly requiresProject = true;

  public static examples = [
    messages.getMessage('exampleCaption1'),
    '    $ sfdx force:cmdt:record:insert --filepath path/to/my.csv --typename My_CMDT_Name',
    messages.getMessage('exampleCaption2'),
    '    $ sfdx force:cmdt:record:insert --filepath path/to/my.csv --typename My_CMDT_Name --inputdir "' +
      messages.getMessage('inputDirectoryFlagExample') +
      '" --namecolumn "PrimaryKey"',
  ];

  public static flags = {
    loglevel,
    filepath: Flags.string({
      char: 'f',
      summary: messages.getMessage('filepathFlagDescription'),
      description: messages.getMessage('filepathFlagLongDescription'),
      required: true,
    }),
    typename: Flags.string({
      char: 't',
      summary: messages.getMessage('typenameFlagDescription'),
      description: messages.getMessage('typenameFlagLongDescription'),
      required: true,
    }),
    inputdir: Flags.directory({
      char: 'i',
      summary: messages.getMessage('inputDirectoryFlagDescription'),
      description: messages.getMessage('inputDirectoryFlagLongDescription'),
      default: path.join('force-app', 'main', 'default', 'objects'),
    }),
    outputdir: Flags.directory({
      char: 'd',
      summary: messages.getMessage('outputDirectoryFlagDescription'),
      description: messages.getMessage('outputDirectoryFlagLongDescription'),
      default: path.join('force-app', 'main', 'default', 'customMetadata'),
    }),
    namecolumn: Flags.string({
      char: 'n',
      summary: messages.getMessage('namecolumnFlagDescription'),
      description: messages.getMessage('namecolumnFlagLongDescription'),
      default: 'Name',
    }),
  };

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public async run(): Promise<CreateConfig[]> {
    const { flags } = await this.parse(Insert);
    const createUtil = new CreateUtil();
    let typename = flags.typename;
    const inputdir = flags.inputdir;
    const outputdir = flags.outputdir;
    const dirName = appendDirectorySuffix(typename);
    const fieldDirPath = path.join(inputdir, dirName, 'fields');
    const fileNames = await fs.promises.readdir(fieldDirPath);
    const nameField = flags.namecolumn;

    // forgive them if they passed in type__mdt, and cut off the __mdt
    if (typename.endsWith('__mdt')) {
      typename = typename.substring(0, typename.indexOf('__mdt'));
    }

    // if customMetadata folder does not exist, create it
    await fs.promises.mkdir(outputdir, { recursive: true });

    const fileData = await createUtil.getFileData(fieldDirPath, fileNames);
    const csvDataAry = (await csv().fromFile(flags.filepath)) as Record[];

    const metadataTypeFields = getFieldNames(fileData, nameField);
    if (csvDataAry.length > 0) {
      const record = csvDataAry[0];
      for (const key in record) {
        if (!metadataTypeFields.includes(key)) {
          throw new SfError(messages.getMessage('fieldNotFoundError', [key, typename]));
        }
      }
    }

    // find the cmdt in the inputdir.
    // loop through files and create records that match fields

    const recordConfigs = csvDataAry.map(
      (record): CreateConfig => ({
        typename,
        recordname: (record[nameField] as string).replace(' ', '_'),
        label: record[nameField] as string,
        inputdir,
        outputdir,
        protected: false,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        varargs: Object.fromEntries(
          // TODO: throw an error if any of the fields in the csvDataAry do not exist in the fileData
          fileData.map((file) => {
            if (file.fullName) {
              return record[file.fullName] ? [file.fullName, record[file.fullName]] : [];
            } else {
              throw new SfError('No fullName found in fileData');
            }
          })
        ),
        fileData,
      })
    );
    await Promise.all(recordConfigs.map((r) => createUtil.createRecord(r)));

    this.log(messages.getMessage('successResponse', [flags.filepath, outputdir]));

    return recordConfigs;
  }
}
