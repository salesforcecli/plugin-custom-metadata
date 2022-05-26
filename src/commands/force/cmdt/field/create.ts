/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'fs';
import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfError } from '@salesforce/core';
import { FileWriter } from '../../../../lib/helpers/fileWriter';
import { validateAPIName } from '../../../../lib/helpers/validationUtil';
import { Templates } from '../../../../lib/templates/templates';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('@salesforce/plugin-custom-metadata', 'createField');

interface CmdtFieldCreateResponse {
  fieldName: string;
  label: string;
  fieldtype: string;
}
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
      parse: async (input: string) =>
        Promise.resolve(validateAPIName(input, messages.getMessage('invalidCustomFieldError', [input]))),
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
      min: 0,
    }),
    label: flags.string({
      char: 'l',
      description: messages.getMessage('labelFlagDescription'),
      longDescription: messages.getMessage('labelFlagLongDescription'),
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
  public async run(): Promise<CmdtFieldCreateResponse> {
    const fieldName = this.flags.fieldname as string; // this should become the new file name
    const label = (this.flags.label as string) ?? fieldName;
    const fieldtype = this.flags.fieldtype as string;
    const picklistvalues = (this.flags.picklistvalues as string[]) ?? [];
    const decimalplaces = this.flags.decimalplaces as number;

    if (fieldtype === 'Picklist' && picklistvalues.length === 0) {
      throw new SfError(messages.getMessage('picklistValuesNotSuppliedError'));
    }
    const templates = new Templates();
    const data = templates.createDefaultTypeStructure(fieldName, fieldtype, label, picklistvalues, decimalplaces);
    const fieldXML = templates.createFieldXML(data, false);
    const writer = new FileWriter();
    const saveResults = await writer.writeFieldFile(fs, this.flags.outputdir as string, fieldName, fieldXML);

    this.ux.log(messages.getMessage('targetDirectory', [saveResults.dir]));
    this.ux.log(messages.getMessage(saveResults.updated ? 'fileUpdate' : 'fileCreated', [saveResults.fileName]));

    return {
      fieldName,
      label,
      fieldtype,
    };
  }
}
