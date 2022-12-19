/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'fs';
import { arrayWithDeprecation, Flags, loglevel, SfCommand } from '@salesforce/sf-plugins-core';
import { Messages, SfError } from '@salesforce/core';
import { FileWriter } from '../../../../lib/helpers/fileWriter';
import { validateAPIName } from '../../../../lib/helpers/validationUtil';
import { Templates } from '../../../../lib/templates/templates';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-custom-metadata', 'createField');

interface CmdtFieldCreateResponse {
  fieldName: string;
  label: string;
  fieldtype: string;
}
export default class Create extends SfCommand<CmdtFieldCreateResponse> {
  public static readonly summary = messages.getMessage('commandDescription');
  public static description = messages.getMessage('commandLongDescription');

  public static examples = [
    messages.getMessage('exampleCaption1'),
    '    $ sfdx force:cmdt:field:create --fieldname MyField --fieldtype Checkbox',
    messages.getMessage('exampleCaption2'),
    '    $ sfdx force:cmdt:field:create --fieldname MyField --fieldtype Picklist --picklistvalues "A,B,C"',
    messages.getMessage('exampleCaption3'),
    '    $ sfdx force:cmdt:field:create --fieldname MyField --fieldtype Number --decimalplaces 2',
  ];

  public static args = [{ name: 'file' }];
  public static readonly requiresProject = true;

  public static flags = {
    loglevel,
    fieldname: Flags.string({
      char: 'n',
      required: true,
      summary: messages.getMessage('nameFlagDescription'),
      description: messages.getMessage('nameFlagLongDescription'),
      parse: async (input: string) =>
        Promise.resolve(validateAPIName(input, messages.getMessage('invalidCustomFieldError', [input]))),
    }),
    fieldtype: Flags.string({
      char: 'f',
      required: true,
      summary: messages.getMessage('fieldTypeDescription'),
      description: messages.getMessage('fieldTypeLongDescription'),
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
    picklistvalues: arrayWithDeprecation({
      char: 'p',
      summary: messages.getMessage('picklistValuesFlagDescription'),
      description: messages.getMessage('picklistValuesFlagLongDescription'),
    }),
    decimalplaces: Flags.integer({
      char: 's',
      summary: messages.getMessage('decimalplacesFlagDescription'),
      description: messages.getMessage('decimalplacesFlagLongDescription'),
      default: 0,
      min: 0,
    }),
    label: Flags.string({
      char: 'l',
      summary: messages.getMessage('labelFlagDescription'),
      description: messages.getMessage('labelFlagLongDescription'),
    }),
    outputdir: Flags.directory({
      char: 'd',
      summary: messages.getMessage('outputDirectoryFlagDescription'),
      description: messages.getMessage('outputDirectoryFlagLongDescription'),
      default: '',
    }),
  };

  public async run(): Promise<CmdtFieldCreateResponse> {
    const { flags } = await this.parse(Create);
    const fieldName = flags.fieldname; // this should become the new file name
    const label = flags.label ?? fieldName;
    const fieldtype = flags.fieldtype;
    const picklistvalues = flags.picklistvalues ?? [];
    const decimalplaces = flags.decimalplaces;

    if (fieldtype === 'Picklist' && picklistvalues?.length === 0) {
      throw new SfError(messages.getMessage('picklistValuesNotSuppliedError'));
    }
    const templates = new Templates();
    const data = templates.createDefaultTypeStructure(fieldName, fieldtype, label, picklistvalues, decimalplaces);
    const fieldXML = templates.createFieldXML(data, false);
    const writer = new FileWriter();
    const saveResults = await writer.writeFieldFile(fs, flags.outputdir, fieldName, fieldXML);

    this.log(messages.getMessage('targetDirectory', [saveResults.dir]));
    this.log(messages.getMessage(saveResults.updated ? 'fileUpdate' : 'fileCreated', [saveResults.fileName]));

    return {
      fieldName,
      label,
      fieldtype,
    };
  }
}
