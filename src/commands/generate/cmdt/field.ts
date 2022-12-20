/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'fs';
import { arrayWithDeprecation, Flags, loglevel, SfCommand } from '@salesforce/sf-plugins-core';
import { Messages, SfError } from '@salesforce/core';
import { FileWriter } from '../../../lib/helpers/fileWriter';
import { validateAPIName } from '../../../lib/helpers/validationUtil';
import { createDefaultTypeStructure, createFieldXML } from '../../../lib/templates/templates';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-custom-metadata', 'field');

export interface CmdtFieldCreateResponse {
  fieldName: string;
  label: string;
  fieldtype: string;
}
export default class Create extends SfCommand<CmdtFieldCreateResponse> {
  public static readonly summary = messages.getMessage('commandDescription');
  public static readonly description = messages.getMessage('commandLongDescription');
  public static readonly examples = messages.getMessages('examples');
  public static readonly requiresProject = true;
  public static args = [{ name: 'file' }];
  public static readonly aliases = ['force:cmdt:field:create', 'cmdt:field:create'];
  public static readonly flags = {
    loglevel,
    name: Flags.string({
      char: 'n',
      required: true,
      summary: messages.getMessage('nameFlagDescription'),
      description: messages.getMessage('nameFlagLongDescription'),
      parse: async (input: string) =>
        Promise.resolve(validateAPIName(input, messages.getMessage('invalidCustomFieldError', [input]))),
      aliases: ['fieldname'],
    }),
    type: Flags.string({
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
      aliases: ['fieldtype'],
    }),
    'picklist-values': arrayWithDeprecation({
      char: 'p',
      summary: messages.getMessage('picklistValuesFlagDescription'),
      description: messages.getMessage('picklistValuesFlagLongDescription'),
      aliases: ['picklistvalues'],
    }),
    'decimal-places': Flags.integer({
      char: 's',
      summary: messages.getMessage('decimalplacesFlagDescription'),
      description: messages.getMessage('decimalplacesFlagLongDescription'),
      default: 0,
      min: 0,
      aliases: ['decimalplaces'],
    }),
    label: Flags.string({
      char: 'l',
      summary: messages.getMessage('labelFlagDescription'),
      description: messages.getMessage('labelFlagLongDescription'),
    }),
    'output-directory': Flags.directory({
      char: 'd',
      summary: messages.getMessage('outputDirectoryFlagDescription'),
      description: messages.getMessage('outputDirectoryFlagLongDescription'),
      default: '',
      aliases: ['outputdir', 'outputdirectory'],
    }),
  };

  public async run(): Promise<CmdtFieldCreateResponse> {
    const { flags } = await this.parse(Create);
    const picklistvalues = flags['picklist-values'] ?? [];

    if (flags.type === 'Picklist' && picklistvalues?.length === 0) {
      throw new SfError(messages.getMessage('picklistValuesNotSuppliedError'));
    }
    const data = createDefaultTypeStructure(
      flags.name,
      flags.type,
      flags.label ?? flags.name,
      picklistvalues,
      flags['decimal-places']
    );
    const fieldXML = createFieldXML(data, false);
    const writer = new FileWriter();
    const saveResults = await writer.writeFieldFile(fs, flags['output-directory'], flags.name, fieldXML);

    this.log(messages.getMessage('targetDirectory', [saveResults.dir]));
    this.log(messages.getMessage(saveResults.updated ? 'fileUpdate' : 'fileCreated', [saveResults.fileName]));

    return {
      fieldName: flags.name,
      label: flags.label ?? flags.name,
      fieldtype: flags.type,
    };
  }
}
