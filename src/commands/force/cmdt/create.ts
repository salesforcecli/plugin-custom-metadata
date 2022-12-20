/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'fs';
import { Flags, loglevel, SfCommand } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { FileWriter } from '../../../lib/helpers/fileWriter';
import { validateMetadataTypeName, validateLessThanForty } from '../../../lib/helpers/validationUtil';
import { Templates } from '../../../lib/templates/templates';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-custom-metadata', 'createType');

interface CmdtCreateResponse {
  typename: string;
  label: string;
  pluralLabel: string;
  visibility: string;
}
export default class Create extends SfCommand<CmdtCreateResponse> {
  public static readonly summary = messages.getMessage('commandDescription');
  public static readonly description = messages.getMessage('commandLongDescription');

  public static examples = [
    messages.getMessage('exampleCaption1'),
    '    $ sfdx force:cmdt:create --typename MyCustomType',
    messages.getMessage('exampleCaption2'),
    '    $ sfdx force:cmdt:create --typename MyCustomType --label "' +
      messages.getMessage('labelFlagExample') +
      '" ' +
      '--plurallabel "' +
      messages.getMessage('plurallabelFlagExample') +
      '" --visibility Protected',
  ];

  public static args = [{ name: 'file' }];
  public static requiresProject = true;

  public static flags = {
    loglevel,
    'type-name': Flags.string({
      char: 'n',
      summary: messages.getMessage('nameFlagDescription'),
      description: messages.getMessage('nameFlagLongDescription'),
      required: true,
      parse: async (input: string) => Promise.resolve(validateMetadataTypeName(input)),
      aliases: ['typename'],
    }),
    label: Flags.string({
      char: 'l',
      summary: messages.getMessage('labelFlagDescription'),
      description: messages.getMessage('labelFlagLongDescription'),
      parse: async (input) =>
        Promise.resolve(validateLessThanForty(input, messages.getMessage('errorNotValidLabelName', [input]))),
    }),
    'plural-label': Flags.string({
      char: 'p',
      summary: messages.getMessage('plurallabelFlagDescription'),
      description: messages.getMessage('plurallabelFlagLongDescription'),
      parse: async (input) =>
        Promise.resolve(validateLessThanForty(input, messages.getMessage('errorNotValidPluralLabelName', [input]))),
      aliases: ['plurallabel'],
    }),
    visibility: Flags.string({
      char: 'v',
      summary: messages.getMessage('visibilityFlagDescription'),
      description: messages.getMessage('visibilityFlagLongDescription'),
      options: ['PackageProtected', 'Protected', 'Public'],
      default: 'Public',
    }),
    'output-directory': Flags.directory({
      char: 'd',
      summary: messages.getMessage('outputDirectoryFlagDescription'),
      description: messages.getMessage('outputDirectoryFlagLongDescription'),
      default: '',
      aliases: ['outputdir', 'outputdirectory'],
    }),
  };

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public async run(): Promise<CmdtCreateResponse> {
    const { flags } = await this.parse(Create);
    const label = flags.label ?? flags['type-name'].replace('__mdt', ''); // If a label is not provided default using the dev name. trim __mdt out
    const pluralLabel = flags['plural-label'] ?? label;
    const templates = new Templates();
    const fileWriter = new FileWriter();

    const objectXML = templates.createObjectXML({ label, pluralLabel }, flags.visibility);
    const saveResults = await fileWriter.writeTypeFile(fs, flags['output-directory'], flags['type-name'], objectXML);

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
