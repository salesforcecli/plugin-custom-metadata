/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'fs';
import { flags, SfdxCommand } from '@salesforce/command';
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
export default class Create extends SfdxCommand {
  public static description = messages.getMessage('commandDescription');
  public static longDescription = messages.getMessage('commandLongDescription');

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

  protected static flagsConfig = {
    typename: flags.string({
      char: 'n',
      description: messages.getMessage('nameFlagDescription'),
      longDescription: messages.getMessage('nameFlagLongDescription'),
      required: true,
      parse: async (input: string) => Promise.resolve(validateMetadataTypeName(input)),
    }),
    label: flags.string({
      char: 'l',
      description: messages.getMessage('labelFlagDescription'),
      longDescription: messages.getMessage('labelFlagLongDescription'),
      parse: async (input) =>
        Promise.resolve(validateLessThanForty(input, messages.getMessage('errorNotValidLabelName', [input]))),
    }),
    plurallabel: flags.string({
      char: 'p',
      description: messages.getMessage('plurallabelFlagDescription'),
      longDescription: messages.getMessage('plurallabelFlagLongDescription'),
      parse: async (input) =>
        Promise.resolve(validateLessThanForty(input, messages.getMessage('errorNotValidPluralLabelName', [input]))),
    }),
    visibility: flags.enum({
      char: 'v',
      description: messages.getMessage('visibilityFlagDescription'),
      longDescription: messages.getMessage('visibilityFlagLongDescription'),
      options: ['PackageProtected', 'Protected', 'Public'],
      default: 'Public',
    }),
    outputdir: flags.directory({
      char: 'd',
      description: messages.getMessage('outputDirectoryFlagDescription'),
      longDescription: messages.getMessage('outputDirectoryFlagLongDescription'),
      default: '',
    }),
  };

  protected static requiresProject = true;

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public async run(): Promise<CmdtCreateResponse> {
    const typename = this.flags.typename as string; // this should become the new file name
    const label = (this.flags.label as string) ?? typename.replace('__mdt', ''); // If a label is not provided default using the dev name. trim __mdt out
    const visibility = this.flags.visibility as string;
    const pluralLabel = (this.flags.plurallabel as string) ?? label;
    const templates = new Templates();
    const fileWriter = new FileWriter();

    const objectXML = templates.createObjectXML({ label, pluralLabel }, visibility);
    const saveResults = await fileWriter.writeTypeFile(fs, this.flags.outputdir as string, typename, objectXML);

    this.ux.log(messages.getMessage('targetDirectory', [saveResults.dir]));
    this.ux.log(messages.getMessage(saveResults.updated ? 'fileUpdate' : 'fileCreated', [saveResults.fileName]));

    return {
      typename,
      label,
      pluralLabel,
      visibility,
    };
  }
}
