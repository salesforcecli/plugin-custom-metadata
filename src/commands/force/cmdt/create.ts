/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'fs';
import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { FileWriter } from '../../../lib/helpers/fileWriter';
import { validateMetadataTypeName, validateLessThanForty } from '../../../lib/helpers/validationUtil';
import { Templates } from '../../../lib/templates/templates';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
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
    typename: Flags.string({
      char: 'n',
      summary: messages.getMessage('nameFlagDescription'),
      description: messages.getMessage('nameFlagLongDescription'),
      required: true,
      parse: async (input: string) => Promise.resolve(validateMetadataTypeName(input)),
    }),
    label: Flags.string({
      char: 'l',
      summary: messages.getMessage('labelFlagDescription'),
      description: messages.getMessage('labelFlagLongDescription'),
      parse: async (input) =>
        Promise.resolve(validateLessThanForty(input, messages.getMessage('errorNotValidLabelName', [input]))),
    }),
    plurallabel: Flags.string({
      char: 'p',
      summary: messages.getMessage('plurallabelFlagDescription'),
      description: messages.getMessage('plurallabelFlagLongDescription'),
      parse: async (input) =>
        Promise.resolve(validateLessThanForty(input, messages.getMessage('errorNotValidPluralLabelName', [input]))),
    }),
    visibility: Flags.enum({
      char: 'v',
      summary: messages.getMessage('visibilityFlagDescription'),
      description: messages.getMessage('visibilityFlagLongDescription'),
      options: ['PackageProtected', 'Protected', 'Public'],
      default: 'Public',
    }),
    outputdir: Flags.directory({
      char: 'd',
      summary: messages.getMessage('outputDirectoryFlagDescription'),
      description: messages.getMessage('outputDirectoryFlagLongDescription'),
      default: '',
    }),
  };

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public async run(): Promise<CmdtCreateResponse> {
    const { flags } = await this.parse(Create);
    const typename = flags.typename; // this should become the new file name
    const label = (flags.label as string) ?? typename.replace('__mdt', ''); // If a label is not provided default using the dev name. trim __mdt out
    const visibility = flags.visibility;
    const pluralLabel = (flags.plurallabel as string) ?? label;
    const templates = new Templates();
    const fileWriter = new FileWriter();

    const objectXML = templates.createObjectXML({ label, pluralLabel }, visibility);
    const saveResults = await fileWriter.writeTypeFile(fs, flags.outputdir, typename, objectXML);

    this.log(messages.getMessage('targetDirectory', [saveResults.dir]));
    this.log(messages.getMessage(saveResults.updated ? 'fileUpdate' : 'fileCreated', [saveResults.fileName]));

    return {
      typename,
      label,
      pluralLabel,
      visibility,
    };
  }
}
