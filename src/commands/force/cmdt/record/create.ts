/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'fs';
import * as path from 'path';
import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfError } from '@salesforce/core';
import { CustomField } from 'jsforce/api/metadata';
import { CreateUtil } from '../../../../lib/helpers/createUtil';
import {
  validateMetadataRecordName,
  validateMetadataTypeName,
  validateLessThanForty,
} from '../../../../lib/helpers/validationUtil';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('@salesforce/plugin-custom-metadata', 'createRecord');

interface CmdtRecordCreateResponse {
  typename: string;
  recordname: string;
  label: string;
  inputdir: string;
  outputdir: string;
  protectedFlag: boolean;
  varargs: Record<string, unknown>;
  fileData: CustomField[];
}
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
      parse: async (input) => Promise.resolve(validateMetadataTypeName(input)),
    }),
    recordname: flags.string({
      char: 'n',
      description: messages.getMessage('recordNameFlagDescription'),
      longDescription: messages.getMessage('recordNameFlagLongDescription'),
      required: true,
      parse: async (input) => Promise.resolve(validateMetadataRecordName(input)),
    }),
    label: flags.string({
      char: 'l',
      description: messages.getMessage('labelFlagDescription'),
      longDescription: messages.getMessage('labelFlagLongDescription'),
      parse: async (input) =>
        Promise.resolve(validateLessThanForty(input, messages.getMessage('notAValidLabelNameError', [input]))),
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
      default: path.join('force-app', 'main', 'default', 'objects'),
    }),
    outputdir: flags.directory({
      char: 'd',
      description: messages.getMessage('outputDirectoryFlagDescription'),
      longDescription: messages.getMessage('outputDirectoryFlagLongDescription'),
      default: path.join('force-app', 'main', 'default', 'customMetadata'),
    }),
  };

  protected static varargs = {
    required: false,
    validator: (name: string): void => {
      // only custom fields allowed
      if (!name.endsWith('__c')) {
        const errMsg = `Invalid parameter [${name}] found`;
        const errName = 'InvalidVarargName';
        const errAction = messages.getMessage('errorInvalidCustomField');
        throw new SfError(errMsg, errName, [errAction]);
      }
    },
  };

  protected static requiresProject = true;

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public async run(): Promise<CmdtRecordCreateResponse> {
    try {
      const createUtil = new CreateUtil();
      let typename = this.flags.typename as string;
      const recordname = this.flags.recordname as string;
      const label = (this.flags.label as string) ?? recordname;
      const protectedFlag = (this.flags.protected as string) === 'true';
      const inputdir = this.flags.inputdir as string;
      const outputdir = this.flags.outputdir as string;
      const dirName = createUtil.appendDirectorySuffix(typename);
      const fieldDirPath = path.join(inputdir, dirName, 'fields');
      const fileNames = await fs.promises.readdir(fieldDirPath);

      // forgive them if they passed in type__mdt, and cut off the __mdt
      if (typename.endsWith('__mdt')) {
        typename = typename.substring(0, typename.indexOf('__mdt'));
      }

      // if customMetadata folder does not exist, create it
      await fs.promises.mkdir(outputdir, { recursive: true });

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

      this.ux.log(messages.getMessage('successResponse', [typename, recordname, label, protectedFlag, outputdir]));

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
      if (err instanceof Error) {
        this.ux.log(err.message);
      }
    }
  }
}
