/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import fs from 'node:fs';
import path from 'node:path';

import { Flags, loglevel, parseVarArgs, SfCommand } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import type { CustomField } from 'jsforce/api/metadata';
import { appendDirectorySuffix, createRecord, getFileData } from '../../../shared/helpers/createUtil.js';
import {
  validateMetadataRecordName,
  validateMetadataTypeName,
  validateLessThanForty,
} from '../../../shared/helpers/validationUtil.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-custom-metadata', 'record');

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
  public static readonly strict = false;
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly requiresProject = true;
  public static readonly aliases = ['force:cmdt:record:create', 'cmdt:record:create'];
  public static readonly deprecateAliases = true;
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    loglevel,
    'type-name': Flags.string({
      char: 't',
      summary: messages.getMessage('flags.type-name.summary'),
      required: true,
      parse: async (input) => Promise.resolve(validateMetadataTypeName(input)),
      aliases: ['typename'],
    }),
    'record-name': Flags.string({
      char: 'n',
      summary: messages.getMessage('flags.record-name.summary'),
      required: true,
      parse: async (input) => Promise.resolve(validateMetadataRecordName(input)),
      aliases: ['recordname'],
    }),
    label: Flags.string({
      char: 'l',
      summary: messages.getMessage('flags.label.summary'),
      parse: async (input) =>
        Promise.resolve(validateLessThanForty(input, messages.getMessage('notAValidLabelNameError', [input]))),
    }),
    // I hate this flag so much, but have to preserve it
    protected: Flags.string({
      char: 'p',
      summary: messages.getMessage('flags.protected.summary'),
      description: messages.getMessage('flags.protected.description'),
      options: ['true', 'false'],
      default: 'false',
    }),
    'input-directory': Flags.directory({
      char: 'i',
      summary: messages.getMessage('flags.input-directory.summary'),
      default: path.join('force-app', 'main', 'default', 'objects'),
      aliases: ['inputdir', 'inputdirectory'],
      exists: true,
    }),
    'output-directory': Flags.directory({
      char: 'd',
      summary: messages.getMessage('flags.output-directory.summary'),
      default: path.join('force-app', 'main', 'default', 'customMetadata'),
      aliases: ['outputdir', 'outputdirectory'],
    }),
  };

  public async run(): Promise<CmdtRecordCreateResponse> {
    const { flags, args, argv } = await this.parse(Create);
    const varargs = parseVarArgs(args, argv as string[]);
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
