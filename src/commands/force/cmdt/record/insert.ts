/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'fs';
import * as path from 'path';
import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfError } from '@salesforce/core';
import { Record } from 'jsforce';
import * as csv from '../../../../../csvtojson';
import { CreateUtil } from '../../../../lib/helpers/createUtil';
import { FileWriter } from '../../../../lib/helpers/fileWriter';
import { CreateConfig } from '../../../../lib/interfaces/createConfig';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-custom-metadata', 'insertRecord');

export default class Insert extends SfdxCommand {
  public static description = messages.getMessage('commandDescription');
  public static longDescription = messages.getMessage('commandLongDescription');

  public static examples = [
    messages.getMessage('exampleCaption1'),
    '    $ sfdx force:cmdt:record:insert --filepath path/to/my.csv --typename My_CMDT_Name',
    messages.getMessage('exampleCaption2'),
    '    $ sfdx force:cmdt:record:insert --filepath path/to/my.csv --typename My_CMDT_Name --inputdir "' +
      messages.getMessage('inputDirectoryFlagExample') +
      '" --namecolumn "PrimaryKey"',
  ];

  protected static flagsConfig = {
    filepath: flags.string({
      char: 'f',
      description: messages.getMessage('filepathFlagDescription'),
      longDescription: messages.getMessage('filepathFlagLongDescription'),
      required: true,
    }),
    typename: flags.string({
      char: 't',
      description: messages.getMessage('typenameFlagDescription'),
      longDescription: messages.getMessage('typenameFlagLongDescription'),
      required: true,
    }),
    inputdir: flags.directory({
      char: 'i',
      description: messages.getMessage('inputDirectoryFlagDescription'),
      longDescription: messages.getMessage('inputDirectoryFlagLongDescription'),
      default: path.join('force-app', 'main', 'default', 'objects'),
    }),
    outputdir: flags.directory({
      char: 'd',
      description: messages.getMessage('outputDirectoryFlagDescription'),
      longDescription: messages.getMessage('outputDirectoryFlagLongDescription'),
      default: path.join('force-app', 'main', 'default', 'customMetadata'),
    }),
    namecolumn: flags.string({
      char: 'n',
      description: messages.getMessage('namecolumnFlagDescription'),
      longDescription: messages.getMessage('namecolumnFlagLongDescription'),
      default: 'Name',
    }),
  };

  protected static requiresProject = true;

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public async run(): Promise<CreateConfig[]> {
    const createUtil = new CreateUtil();
    const fileWriter = new FileWriter();
    const filepath = this.flags.filepath as string;
    let typename = this.flags.typename as string;
    const inputdir = this.flags.inputdir as string;
    const outputdir = this.flags.outputdir as string;
    const dirName = createUtil.appendDirectorySuffix(typename);
    const fieldDirPath = path.join(`${fileWriter.createDir(inputdir)}${dirName}`, 'fields');
    const fileNames = await fs.promises.readdir(fieldDirPath);
    const nameField = this.flags.namecolumn as string;

    // forgive them if they passed in type__mdt, and cut off the __mdt
    if (typename.endsWith('__mdt')) {
      typename = typename.substring(0, typename.indexOf('__mdt'));
    }

    // if customMetadata folder does not exist, create it
    await fs.promises.mkdir(outputdir, { recursive: true });

    const fileData = await createUtil.getFileData(fieldDirPath, fileNames);
    const csvDataAry = (await csv().fromFile(filepath)) as Record[];

    const metadataTypeFields = createUtil.getFieldNames(fileData, nameField);
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
          fileData.map((file) => (record[file.fullName] ? [file.fullName, record[file.fullName]] : []))
        ),
        fileData,
      })
    );
    await Promise.all(recordConfigs.map((r) => createUtil.createRecord(r)));

    this.ux.log(messages.getMessage('successResponse', [filepath, outputdir]));

    return recordConfigs;
  }
}
