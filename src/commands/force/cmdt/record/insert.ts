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
    csv: Flags.string({
      char: 'f',
      summary: messages.getMessage('filepathFlagDescription'),
      description: messages.getMessage('filepathFlagLongDescription'),
      required: true,
      aliases: ['filepath'],
    }),
    'type-name': Flags.string({
      char: 't',
      summary: messages.getMessage('typenameFlagDescription'),
      description: messages.getMessage('typenameFlagLongDescription'),
      required: true,
      aliases: ['typename'],
    }),
    'input-directory': Flags.directory({
      char: 'i',
      summary: messages.getMessage('inputDirectoryFlagDescription'),
      description: messages.getMessage('inputDirectoryFlagLongDescription'),
      default: path.join('force-app', 'main', 'default', 'objects'),
      aliases: ['inputdir', 'inputdirectory'],
    }),
    'output-directory': Flags.directory({
      char: 'd',
      summary: messages.getMessage('outputDirectoryFlagDescription'),
      description: messages.getMessage('outputDirectoryFlagLongDescription'),
      default: path.join('force-app', 'main', 'default', 'customMetadata'),
      aliases: ['outputdir', 'outputdirectory'],
    }),
    'name-column': Flags.string({
      char: 'n',
      summary: messages.getMessage('namecolumnFlagDescription'),
      description: messages.getMessage('namecolumnFlagLongDescription'),
      default: 'Name',
      aliases: ['namecolumn'],
    }),
  };

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public async run(): Promise<CreateConfig[]> {
    const { flags } = await this.parse(Insert);
    const createUtil = new CreateUtil();
    const dirName = appendDirectorySuffix(flags['type-name']);
    const fieldDirPath = path.join(flags['input-directory'], dirName, 'fields');
    const fileNames = await fs.promises.readdir(fieldDirPath);

    // if customMetadata folder does not exist, create it
    await fs.promises.mkdir(flags['output-directory'], { recursive: true });

    const fileData = await createUtil.getFileData(fieldDirPath, fileNames);
    const csvDataAry = (await csv().fromFile(flags.csv)) as Record[];

    const metadataTypeFields = getFieldNames(fileData, flags['name-column']);
    if (csvDataAry.length > 0) {
      const record = csvDataAry[0];
      for (const key in record) {
        if (!metadataTypeFields.includes(key)) {
          throw new SfError(messages.getMessage('fieldNotFoundError', [key, flags['type-name']]));
        }
      }
    }

    // find the cmdt in the inputdir.
    // loop through files and create records that match fields

    const recordConfigs = csvDataAry.map(
      (record): CreateConfig => ({
        typename: flags['type-name'],
        recordname: (record[flags['name-column']] as string).replace(' ', '_'),
        label: record[flags['name-column']] as string,
        inputdir: flags['input-directory'],
        outputdir: flags['output-directory'],
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

    this.log(messages.getMessage('successResponse', [flags.filepath, flags['output-directory']]));

    return recordConfigs;
  }
}
