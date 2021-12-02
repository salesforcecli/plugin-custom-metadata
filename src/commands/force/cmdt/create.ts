/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError, fs } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import { FileWriter } from '../../../lib/helpers/fileWriter';
import { ValidationUtil } from '../../../lib/helpers/validationUtil';
import { SaveResults } from '../../../lib/interfaces/saveResults';
import { Templates } from '../../../lib/templates/templates';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages(
  '@salesforce/plugin-custom-metadata',
  'createType'
);

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
    }),
    label: flags.string({
      char: 'l',
      description: messages.getMessage('labelFlagDescription'),
      longDescription: messages.getMessage('labelFlagLongDescription'),
    }),
    plurallabel: flags.string({
      char: 'p',
      description: messages.getMessage('plurallabelFlagDescription'),
      longDescription: messages.getMessage('plurallabelFlagLongDescription'),
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
      longDescription: messages.getMessage(
        'outputDirectoryFlagLongDescription'
      ),
    }),
  };

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = true;

  public async run(): Promise<AnyJson> {
    const typename = this.flags.typename; // this should become the new file name
    const label = this.flags.label || this.flags.typename.replace('__mdt', ''); // If a label is not provided default using the dev name. trim __mdt out
    const pluralLabel = this.flags.plurallabel || label;
    const visibility = this.flags.visibility || 'Public';
    const dir = this.flags.outputdir || '';
    const templates = new Templates();
    const fileWriter = new FileWriter();
    let saveResults: SaveResults;

    const validator = new ValidationUtil();
    if (!validator.validateMetadataTypeName(typename)) {
      throw new SfdxError(
        messages.getMessage('errorNotValidAPIName', [typename])
      );
    }
    if (!validator.validateLessThanForty(label)) {
      throw new SfdxError(
        messages.getMessage('errorNotValidLabelName', [label])
      );
    }

    if (!validator.validateLessThanForty(pluralLabel)) {
      throw new SfdxError(
        messages.getMessage('errorNotValidPluralLabelName', [pluralLabel])
      );
    }

    const objectXML = templates.createObjectXML(
      { label, pluralLabel },
      visibility
    );
    saveResults = await fileWriter.writeTypeFile(fs, dir, typename, objectXML);

    this.ux.log(messages.getMessage('targetDirectory', [saveResults.dir]));
    this.ux.log(
      messages.getMessage(saveResults.updated ? 'fileUpdate' : 'fileCreated', [
        saveResults.fileName,
      ])
    );

    return {
      typename,
      label,
      pluralLabel,
      visibility,
    };
  }
}
