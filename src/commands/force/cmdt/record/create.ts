/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'fs';
import * as path from 'path';
import { Flags, loglevel, parseVarArgs, SfCommand } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { CustomField } from 'jsforce/api/metadata';
import { CreateUtil, appendDirectorySuffix } from '../../../../lib/helpers/createUtil';
import {
  validateMetadataRecordName,
  validateMetadataTypeName,
  validateLessThanForty,
} from '../../../../lib/helpers/validationUtil';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-custom-metadata', 'createRecord');

interface CmdtRecordCreateResponse {
  typename: string;
  recordname: string;
  label: string;
  inputdir: string;
  outputdir: string;
  protectedFlag: boolean;
  varargs: Record<string, unknown>;
  fileData: CustomField[];
}
export default class Create extends SfCommand<CmdtRecordCreateResponse> {
  public static readonly summary = messages.getMessage('commandDescription');
  public static readonly description = messages.getMessage('commandLongDescription');
  public static readonly requiresProject = true;

  public static examples = [
    messages.getMessage('exampleCaption1'),
    '    $ sfdx force:cmdt:record:create --typename MyCMT__mdt --recordname MyRecord My_Custom_Field_1=Foo My_Custom_Field_2=Bar',
    messages.getMessage('exampleCaption2'),
    '    $ sfdx force:cmdt:record:create --typename MyCMT__mdt --recordname MyRecord --label "' +
      messages.getMessage('labelFlagExample') +
      '" ' +
      '--protected true My_Custom_Field_1=Foo My_Custom_Field_2=Bar',
  ];

  public static flags = {
    loglevel,
    typename: Flags.string({
      char: 't',
      summary: messages.getMessage('typenameFlagDescription'),
      description: messages.getMessage('typenameFlagLongDescription'),
      required: true,
      parse: async (input) => Promise.resolve(validateMetadataTypeName(input)),
    }),
    recordname: Flags.string({
      char: 'n',
      summary: messages.getMessage('recordNameFlagDescription'),
      description: messages.getMessage('recordNameFlagLongDescription'),
      required: true,
      parse: async (input) => Promise.resolve(validateMetadataRecordName(input)),
    }),
    label: Flags.string({
      char: 'l',
      summary: messages.getMessage('labelFlagDescription'),
      description: messages.getMessage('labelFlagLongDescription'),
      parse: async (input) =>
        Promise.resolve(validateLessThanForty(input, messages.getMessage('notAValidLabelNameError', [input]))),
    }),
    protected: Flags.string({
      char: 'p',
      summary: messages.getMessage('protectedFlagDescription'),
      description: messages.getMessage('protectedFlagLongDescription'),
      options: ['true', 'false'],
      default: 'false',
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
  };

  public async run(): Promise<CmdtRecordCreateResponse> {
    const { flags, args, argv } = await this.parse(Create);
    const varargs = parseVarArgs(args, argv);
    const createUtil = new CreateUtil();
    const label = flags.label ?? flags.recordname;
    const protectedFlag = flags.protected === 'true';
    const dirName = appendDirectorySuffix(flags.typename);
    const fieldDirPath = path.join(flags.inputdir, dirName, 'fields');
    const fileNames = await fs.promises.readdir(fieldDirPath);

    // if customMetadata folder does not exist, create it
    await fs.promises.mkdir(flags.outputdir, { recursive: true });

    const fileData = await createUtil.getFileData(fieldDirPath, fileNames);

    await createUtil.createRecord({
      typename: flags.typename,
      recordname: flags.recordname,
      label,
      inputdir: flags.inputdir,
      outputdir: flags.outputdir,
      protected: protectedFlag,
      varargs,
      fileData,
    });

    this.log(
      messages.getMessage('successResponse', [flags.typename, flags.recordname, label, protectedFlag, flags.outputdir])
    );

    // Return an object to be displayed with --json
    return {
      typename: flags.typename,
      recordname: flags.recordname,
      label,
      inputdir: flags.inputdir,
      outputdir: flags.outputdir,
      protectedFlag,
      varargs,
      fileData,
    };
  }
}
