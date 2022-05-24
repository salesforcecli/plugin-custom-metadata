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
import { CreateUtil } from '../../../../lib/helpers/createUtil';
import { FileWriter } from '../../../../lib/helpers/fileWriter';
import { ValidationUtil } from '../../../../lib/helpers/validationUtil';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages(
  '@salesforce/plugin-custom-metadata',
  'createRecord'
);

export default class Create extends SfdxCommand {
  public static description = messages.getMessage('commandDescription');
  public static longDescription = messages.getMessage('commandLongDescription');

  public static examples = [
    messages.getMessage('exampleCaption1'),
    '    $ sfdx force:cmdt:record:create --typename MyCMT__mdt --recordname MyRecord My_Custom_Field_1=Foo My_Custom_Field_2=Bar',
    messages.getMessage('exampleCaption2'),
    '    $ sfdx force:cmdt:record:create --typename MyCMT__mdt --recordname MyRecord --label "' +
      messages.getMessage('labelFlagExample') +
      '" ' +
      '--protected true My_Custom_Field_1=Foo My_Custom_Field_2=Bar',
  ];

  protected static flagsConfig = {
    typename: flags.string({
      char: 't',
      description: messages.getMessage('typenameFlagDescription'),
      longDescription: messages.getMessage('typenameFlagLongDescription'),
      required: true,
    }),
    recordname: flags.string({
      char: 'n',
      description: messages.getMessage('recordNameFlagDescription'),
      longDescription: messages.getMessage('recordNameFlagLongDescription'),
      required: true,
    }),
    label: flags.string({
      char: 'l',
      description: messages.getMessage('labelFlagDescription'),
      longDescription: messages.getMessage('labelFlagLongDescription'),
    }),
    protected: flags.string({
      char: 'p',
      description: messages.getMessage('protectedFlagDescription'),
      longDescription: messages.getMessage('protectedFlagLongDescription'),
      options: ['true', 'false'],
      default: 'false',
    }),
    inputdir: flags.directory({
      char: 'i',
      description: messages.getMessage('inputDirectoryFlagDescription'),
      longDescription: messages.getMessage('inputDirectoryFlagLongDescription'),
      default: 'force-app/main/default/objects',
    }),
    outputdir: flags.directory({
      char: 'd',
      description: messages.getMessage('outputDirectoryFlagDescription'),
      longDescription: messages.getMessage(
        'outputDirectoryFlagLongDescription'
      ),
      default: 'force-app/main/default/customMetadata',
    }),
  };

  protected static varargs = {
    required: false,
    validator: (name, value) => {
      // only custom fields allowed
      if (!name.endsWith('__c')) {
        const errMsg = `Invalid parameter [${name}] found`;
        const errName = 'InvalidVarargName';
        const errAction = messages.getMessage('errorInvalidCustomField');
        throw new SfdxError(errMsg, errName, [errAction]);
      }
    },
  };

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = true;

  public async run(): Promise<AnyJson> {
    try {
      const validator = new ValidationUtil();
      const createUtil = new CreateUtil();
      const fileWriter = new FileWriter();
      let typename = this.flags.typename;
      const recordname = this.flags.recordname;
      const label = this.flags.label || this.flags.recordname;
      const protectedFlag = this.flags.protected || 'false';
      const inputdir = this.flags.inputdir || 'force-app/main/default/objects';
      const outputdir =
        this.flags.outputdir || 'force-app/main/default/customMetadata';
      const dirName = createUtil.appendDirectorySuffix(typename);
      const fieldDirPath = `${fileWriter.createDir(inputdir)}${dirName}/fields`;

      if (!validator.validateMetadataTypeName(typename)) {
        throw new SfdxError(
          messages.getMessage('notValidAPINameError', [typename])
        );
      }

      if (!validator.validateMetadataRecordName(recordname)) {
        throw new SfdxError(
          messages.getMessage('notAValidRecordNameError', [recordname])
        );
      }

      if (!validator.validateLessThanForty(label)) {
        throw new SfdxError(
          messages.getMessage('notAValidLabelNameError', [label])
        );
      }

      const fileNames = await fs.promises.readdir(fieldDirPath);

      // forgive them if they passed in type__mdt, and cut off the __mdt
      if (typename.endsWith('__mdt')) {
        typename = typename.substring(0, typename.indexOf('__mdt'));
      }

      // if customMetadata folder does not exist, create it
      await fs.promises.mkdir(outputdir, {recursive: true});

      const fileData = await createUtil.getFileData(fieldDirPath, fileNames);

      await createUtil.createRecord({
        typename,
        recordname,
        label,
        inputdir,
        outputdir,
        protected: protectedFlag,
        varargs: this.varargs,
        fileData,
      });

      this.ux.log(
        messages.getMessage('successResponse', [
          typename,
          recordname,
          label,
          protectedFlag,
          outputdir,
        ])
      );

      // Return an object to be displayed with --json
      return {
        typename,
        recordname,
        label,
        inputdir,
        outputdir,
        protectedFlag,
        varargs: this.varargs,
        fileData,
      };
    } catch (err) {
      this.ux.log(err.message);
    }
  }
}
