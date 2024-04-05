/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import fs from 'node:fs';

import { Flags, loglevel, SfCommand } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { writeTypeFile } from '../../../shared/helpers/fileWriter.js';
import { validateMetadataTypeName, validateLessThanForty } from '../../../shared/helpers/validationUtil.js';
import { createObjectXML } from '../../../shared/templates/templates.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-custom-metadata', 'object');

export type CmdtCreateResponse = {
  typename: string;
  label: string;
  pluralLabel: string;
  visibility: string;
}
export default class Create extends SfCommand<CmdtCreateResponse> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly aliases = ['force:cmdt:create', 'cmdt:create'];
  public static readonly deprecateAliases = true;
  public static readonly requiresProject = true;

  public static readonly flags = {
    loglevel,
    'type-name': Flags.string({
      char: 'n',
      summary: messages.getMessage('flags.type-name.summary'),
      description: messages.getMessage('flags.type-name.description'),
      required: true,
      parse: async (input: string) => Promise.resolve(validateMetadataTypeName(input)),
      aliases: ['typename'],
    }),
    label: Flags.string({
      char: 'l',
      summary: messages.getMessage('flags.label.summary'),
      parse: async (input) =>
        Promise.resolve(validateLessThanForty(input, messages.getMessage('errorNotValidLabelName', [input]))),
    }),
    'plural-label': Flags.string({
      char: 'p',
      summary: messages.getMessage('flags.plural-label.summary'),
      parse: async (input) =>
        Promise.resolve(validateLessThanForty(input, messages.getMessage('errorNotValidPluralLabelName', [input]))),
      aliases: ['plurallabel'],
    }),
    visibility: Flags.string({
      char: 'v',
      summary: messages.getMessage('flags.visibility.summary'),
      description: messages.getMessage('flags.visibility.description'),
      options: ['PackageProtected', 'Protected', 'Public'],
      default: 'Public',
    }),
    'output-directory': Flags.directory({
      char: 'd',
      summary: messages.getMessage('flags.output-directory.summary'),
      description: messages.getMessage('flags.output-directory.description'),
      default: '',
      aliases: ['outputdir', 'outputdirectory'],
    }),
  };

  public async run(): Promise<CmdtCreateResponse> {
    const { flags } = await this.parse(Create);
    const label = flags.label ?? flags['type-name'].replace('__mdt', ''); // If a label is not provided default using the dev name. trim __mdt out
    const pluralLabel = flags['plural-label'] ?? label;

    const objectXML = createObjectXML({ label, pluralLabel }, flags.visibility);
    const saveResults = await writeTypeFile(fs, flags['output-directory'], flags['type-name'], objectXML);

    this.log(messages.getMessage('targetDirectory', [saveResults.dir]));
    this.log(messages.getMessage(saveResults.updated ? 'fileUpdate' : 'fileCreated', [saveResults.fileName]));

    return {
      typename: flags['type-name'],
      label,
      pluralLabel,
      visibility: flags.visibility,
    };
  }
}
