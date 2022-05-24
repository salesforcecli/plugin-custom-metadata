/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'fs';
import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import { FileWriter } from '../../../../lib/helpers/fileWriter';
import { ValidationUtil } from '../../../../lib/helpers/validationUtil';
import { SaveResults } from '../../../../lib/interfaces/saveResults';
import { Templates } from '../../../../lib/templates/templates';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages(
  '@salesforce/plugin-custom-metadata',
  'createField'
);

export default class Create extends SfdxCommand {
  public static description = messages.getMessage('commandDescription');
  public static longDescription = messages.getMessage('commandLongDescription');

  public static examples = [
    messages.getMessage('exampleCaption1'),
    '    $ sfdx force:cmdt:field:create --fieldname MyField --fieldtype Checkbox',
    messages.getMessage('exampleCaption2'),
    '    $ sfdx force:cmdt:field:create --fieldname MyField --fieldtype Picklist --picklistvalues "A,B,C"',
    messages.getMessage('exampleCaption3'),
    '    $ sfdx force:cmdt:field:create --fieldname MyField --fieldtype Number --decimalplaces 2',
  ];

  public static args = [{ name: 'file' }];

  protected static flagsConfig = {
    fieldname: flags.string({
      char: 'n',
      required: true,
      description: messages.getMessage('nameFlagDescription'),
      longDescription: messages.getMessage('nameFlagLongDescription'),
    }),
    fieldtype: flags.enum({
      char: 'f',
      required: true,
      description: messages.getMessage('fieldTypeDescription'),
      longDescription: messages.getMessage('nameFlagLongDescription'),
      options: [
        'Checkbox',
        'Date',
        'DateTime',
        'Email',
        'Number',
        'Percent',
        'Phone',
        'Picklist',
        'Text',
        'TextArea',
        'LongTextArea',
        'Url',
      ],
    }),
    picklistvalues: flags.array({
      char: 'p',
      description: messages.getMessage('picklistValuesFlagDescription'),
      longDescription: messages.getMessage('picklistValuesFlagLongDescription'),
    }),
    decimalplaces: flags.number({
      char: 's',
      description: messages.getMessage('decimalplacesFlagDescription'),
      longDescription: messages.getMessage('decimalplacesFlagLongDescription'),
      default: 0,
    }),
    label: flags.string({
      char: 'l',
      description: messages.getMessage('labelFlagDescription'),
      longDescription: messages.getMessage('labelFlagLongDescription'),
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
    const fieldName = this.flags.fieldname; // this should become the new file name
    const label = this.flags.label || this.flags.fieldname;
    const fieldtype = this.flags.fieldtype;
    const picklistvalues = this.flags.picklistvalues || [];
    const decimalplaces = this.flags.decimalplaces || 0;
    const dir = this.flags.outputdir || '';
    let saveResults: SaveResults;

    const validator = new ValidationUtil();
    if (!validator.validateAPIName(fieldName)) {
      throw new SfdxError(
        messages.getMessage('invalidCustomFieldError', [fieldName])
      );
    }
    if (fieldtype === 'Picklist' && picklistvalues.length === 0) {
      throw new SfdxError(
        messages.getMessage('picklistValuesNotSuppliedError')
      );
    }
    if (decimalplaces < 0) {
      throw new SfdxError(messages.getMessage('invalidDecimalError'));
    }
    const templates = new Templates();
    const data = templates.createDefaultTypeStructure(
      fieldName,
      fieldtype,
      label,
      picklistvalues,
      decimalplaces
    );
    const fieldXML = templates.createFieldXML(data, false);
    const writer = new FileWriter();
    saveResults = await writer.writeFieldFile(fs, dir, fieldName, fieldXML);

    this.ux.log(messages.getMessage('targetDirectory', [saveResults.dir]));
    this.ux.log(
      messages.getMessage(saveResults.updated ? 'fileUpdate' : 'fileCreated', [
        saveResults.fileName,
      ])
    );

    // Return an object to be displayed with --json
    return {
      fieldName,
      label,
      fieldtype,
    };
  }
}
