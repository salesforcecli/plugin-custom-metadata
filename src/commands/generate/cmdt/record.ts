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
import { appendDirectorySuffix, createRecord, getFileData } from '../../../lib/helpers/createUtil';
import {
  validateMetadataRecordName,
  validateMetadataTypeName,
  validateLessThanForty,
} from '../../../lib/helpers/validationUtil';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-custom-metadata', 'createRecord');

export interface CmdtRecordCreateResponse {
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
  public static aliases = ['force:cmdt:record:create', 'cmdt:record:create'];
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    loglevel,
    'type-name': Flags.string({
      char: 't',
      summary: messages.getMessage('typenameFlagDescription'),
      description: messages.getMessage('typenameFlagLongDescription'),
      required: true,
      parse: async (input) => Promise.resolve(validateMetadataTypeName(input)),
      aliases: ['typename'],
    }),
    'record-name': Flags.string({
      char: 'n',
      summary: messages.getMessage('recordNameFlagDescription'),
      description: messages.getMessage('recordNameFlagLongDescription'),
      required: true,
      parse: async (input) => Promise.resolve(validateMetadataRecordName(input)),
      aliases: ['recordname'],
    }),
    label: Flags.string({
      char: 'l',
      summary: messages.getMessage('labelFlagDescription'),
      description: messages.getMessage('labelFlagLongDescription'),
      parse: async (input) =>
        Promise.resolve(validateLessThanForty(input, messages.getMessage('notAValidLabelNameError', [input]))),
    }),
    // I hate this flag so much, but have to preserve it
    protected: Flags.string({
      char: 'p',
      summary: messages.getMessage('protectedFlagDescription'),
      description: messages.getMessage('protectedFlagLongDescription'),
      options: ['true', 'false'],
      default: 'false',
    }),
    'input-directory': Flags.directory({
      char: 'i',
      summary: messages.getMessage('inputDirectoryFlagDescription'),
      description: messages.getMessage('inputDirectoryFlagLongDescription'),
      default: path.join('force-app', 'main', 'default', 'objects'),
      aliases: ['inputdir', 'inputdirectory'],
      exists: true,
    }),
    'output-directory': Flags.directory({
      char: 'd',
      summary: messages.getMessage('outputDirectoryFlagDescription'),
      description: messages.getMessage('outputDirectoryFlagLongDescription'),
      default: path.join('force-app', 'main', 'default', 'customMetadata'),
      aliases: ['outputdir', 'outputdirectory'],
    }),
  };

  public async run(): Promise<CmdtRecordCreateResponse> {
    const { flags, args, argv } = await this.parse(Create);
    const varargs = parseVarArgs(args, argv);
    const label = flags.label ?? flags['record-name'];
    const protectedFlag = flags.protected === 'true';
    const dirName = appendDirectorySuffix(flags['type-name']);
    const fieldDirPath = path.join(flags['input-directory'], dirName, 'fields');
    const fileNames = await fs.promises.readdir(fieldDirPath);

    // if customMetadata folder does not exist, create it
    await fs.promises.mkdir(flags['output-directory'], { recursive: true });

    const fileData = await getFileData(fieldDirPath, fileNames);

    await createRecord({
      typename: flags['type-name'],
      recordname: flags['record-name'],
      label,
      inputdir: flags['input-directory'],
      outputdir: flags['output-directory'],
      protected: protectedFlag,
      varargs,
      fileData,
    });

    this.log(
      messages.getMessage('successResponse', [
        flags['type-name'],
        flags['record-name'],
        label,
        protectedFlag,
        flags['output-directory'],
      ])
    );

    // Return an object to be displayed with --json
    return {
      typename: flags['type-name'],
      recordname: flags['record-name'],
      label,
      inputdir: flags['input-directory'],
      outputdir: flags['output-directory'],
      protectedFlag,
      varargs,
      fileData,
    };
  }
}
