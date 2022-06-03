/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'fs';
import * as path from 'path';
import { flags, SfdxCommand } from '@salesforce/command';
import { SfError, Messages } from '@salesforce/core';
import { isEmpty } from '@salesforce/kit';
import { CustomField, CustomObject } from 'jsforce/api/metadata';
import { CreateUtil } from '../../../lib/helpers/createUtil';
import { FileWriter } from '../../../lib/helpers/fileWriter';
import { describeObjFields, cleanQueryResponse, validCustomSettingType } from '../../../lib/helpers/metadataUtil';
import {
  validateAPIName,
  validateMetadataTypeName,
  isValidMetadataRecordName,
} from '../../../lib/helpers/validationUtil';
import { Templates } from '../../../lib/templates/templates';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('@salesforce/plugin-custom-metadata', 'generate');

interface CmdtGenerateResponse {
  outputDir: string;
  recordsOutputDir: string;
}
export default class Generate extends SfdxCommand {
  public static description = messages.getMessage('commandDescription');
  public static longDescription = messages.getMessage('commandLongDescription');

  public static examples = [
    messages.getMessage('exampleCaption1'),
    '    $ sfdx force:cmdt:generate --devname MyCMDT --sobjectname MySourceObject__c',
    messages.getMessage('exampleCaption2'),
    "    $ sfdx force:cmdt:generate --devname MyCMDT --sobjectname MySourceObject__c  --ignoreunsupported --targetusername '" +
      messages.getMessage('targetusernameFlagExample') +
      "'",
    messages.getMessage('exampleCaption3'),
    '    $ sfdx force:cmdt:generate --devname MyCMDT --sobjectname SourceCustomObject__c  --visibility Protected',
    messages.getMessage('exampleCaption4'),
    '    $ sfdx force:cmdt:generate --devname MyCMDT --label "' +
      messages.getMessage('labelFlagExample') +
      '" ' +
      '--plurallabel "' +
      messages.getMessage('plurallabelFlagExample') +
      '" --sobjectname SourceCustomSetting__c  --visibility Protected',
    messages.getMessage('exampleCaption5'),
    "    $ sfdx force:cmdt:generate --devname MyCMDT --sobjectname SourceCustomSetting__c --typeoutputdir '" +
      messages.getMessage('typeoutputdirFlagExample') +
      "'",
    messages.getMessage('exampleCaption6'),
    "    $ sfdx force:cmdt:generate --devname MyCMDT --sobjectname SourceCustomSetting__c --recordsoutputdir '" +
      messages.getMessage('recordsoutputdirFlagExample') +
      "'",
  ];

  public static args = [{ name: 'file' }];

  protected static flagsConfig = {
    // flag with a value (-n, --name=VALUE)
    devname: flags.string({
      char: 'n',
      required: true,
      description: messages.getMessage('devnameFlagDescription'),
      longDescription: messages.getMessage('devnameFlagLongDescription'),
      parse: async (input: string) => Promise.resolve(validateMetadataTypeName(input)),
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
    sobjectname: flags.string({
      char: 's',
      required: true,
      description: messages.getMessage('sobjectnameFlagDescription'),
      longDescription: messages.getMessage('sobjectnameFlagLongDescription'),
      parse: async (sobjectname: string) => Promise.resolve(validateAPIName(sobjectname)),
    }),
    ignoreunsupported: flags.boolean({
      char: 'i',
      description: messages.getMessage('ignoreUnsupportedFlagDescription'),
      longDescription: messages.getMessage('ignoreUnsupportedFlagLongDescription'),
    }),
    typeoutputdir: flags.directory({
      char: 'd',
      description: messages.getMessage('typeoutputdirFlagDescription'),
      longDescription: messages.getMessage('typeoutputdirFlagLongDescription'),
      default: path.join('force-app', 'main', 'default', 'objects'),
    }),
    recordsoutputdir: flags.directory({
      char: 'r',
      description: messages.getMessage('recordsoutputdirFlagDescription'),
      longDescription: messages.getMessage('recordsoutputdirFlagLongDescription'),
      default: path.join('force-app', 'main', 'default', 'customMetadata'),
    }),
  };

  protected static requiresUsername = true;
  protected static requiresProject = true;

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public async run(): Promise<CmdtGenerateResponse> {
    const conn = this.org.getConnection();
    const objname = this.flags.sobjectname as string;
    const devName = this.flags.devname as string;
    const ignoreFields = this.flags.ignoreunsupported as boolean;

    // use default target org connection to get object describe if no source is provided.
    const describeObj = await conn.metadata.read('CustomObject', objname);

    // throw error if the object doesnot exist(empty json as response from the describe call.)
    if (isEmpty(describeObj.fields)) {
      const errMsg = messages.getMessage('sobjectnameNoResultError', [objname]);
      throw new SfError(errMsg, 'sobjectnameNoResultError');
    }
    // check for custom setting
    if (describeObj.customSettingsType) {
      // if custom setting check for type and visbility
      if (!validCustomSettingType(describeObj)) {
        const errMsg = messages.getMessage('customSettingTypeError', [objname]);
        throw new SfError(errMsg, 'customSettingTypeError');
      }
    }

    const visibility = this.flags.visibility as string;
    const label = (this.flags.label as string) ?? devName;
    const pluralLabel = (this.flags.plurallabel as string) ?? label;
    const outputDir = this.flags.typeoutputdir as string;
    const recordsOutputDir = this.flags.recordsoutputdir as string;

    try {
      this.ux.startSpinner('creating the CMDT object');
      // create custom metadata type
      const templates = new Templates();
      const objectXML = templates.createObjectXML({ label, pluralLabel }, visibility);
      const fileWriter = new FileWriter();
      await fileWriter.writeTypeFile(fs, outputDir, devName, objectXML);

      this.ux.setSpinnerStatus('creating the CMDT fields');

      // get all the field details before creating field metadata
      const fields = describeObjFields(describeObj)
        // added type check here to skip the creation of un supported fields
        .filter((f) => !ignoreFields || templates.canConvert(f['type']))
        .flatMap((f) =>
          // check for Geo Location fields before hand and create two different fields for longitude and latitude.
          f.type !== 'Location' ? [f] : convertLocationFieldToText(f)
        );
      // create custom metdata fields
      await Promise.all(
        fields.map((f) =>
          fileWriter.writeFieldFile(
            fs,
            path.join(outputDir, `${devName}__mdt`),
            f.fullName,
            templates.createFieldXML(f, !ignoreFields)
          )
        )
      );

      this.ux.setSpinnerStatus('creating the CMDT records');
      const createUtil = new CreateUtil();
      // if customMetadata folder does not exist, create it
      await fs.promises.mkdir(recordsOutputDir, { recursive: true });
      const fieldDirPath = path.join(outputDir, `${devName}__mdt`, 'fields');
      const fileNames = await fs.promises.readdir(fieldDirPath);
      const fileData = await createUtil.getFileData(fieldDirPath, fileNames);

      // query records from source
      const sObjectRecords = await conn.query(getSoqlQuery(describeObj));
      await Promise.all(
        sObjectRecords.records.map((rec) => {
          const record = cleanQueryResponse(rec, describeObj);
          const lblName = rec['Name'] as string;
          const recordName = isValidMetadataRecordName(lblName) ? lblName : lblName.replace(/ +/g, '_');
          return createUtil.createRecord({
            typename: devName,
            recordname: recordName,
            label: lblName,
            inputdir: outputDir,
            outputdir: recordsOutputDir,
            protected: visibility !== 'Public',
            varargs: record,
            fileData,
            ignorefields: ignoreFields,
          });
        })
      );

      this.ux.stopSpinner('custom metadata type and records creation in completed');
      this.ux.log(`Congrats! Created a ${devName} custom metadata type with ${sObjectRecords.records.length} records!`);
    } catch (e) {
      const targetDir = `${outputDir}${devName}__mdt`;
      // dir might not exist if we never got to the creation step
      if (fs.existsSync(targetDir)) {
        await fs.promises.rm(targetDir, { recursive: true });
      }
      await Promise.all(
        (await fs.promises.readdir(recordsOutputDir))
          .filter((f) => f.startsWith(devName))
          .map((f) => fs.promises.unlink(path.join(recordsOutputDir, f)))
      );

      this.ux.stopSpinner('generate command failed to run');
      const errMsg = messages.getMessage('generateError', [e instanceof Error ? e.message : 'unknown error']);
      throw new SfError(errMsg, 'generateError');
    }

    return { outputDir, recordsOutputDir };
  }
}

const getSoqlQuery = (describeResult: CustomObject): string => {
  const fieldNames = describeResult.fields
    .map((field) => {
      return field.fullName;
    })
    .join(',');
  // Added Name hardcoded as Name field is not retrieved as part of object describe.
  return `SELECT Name, ${fieldNames} FROM ${describeResult.fullName}`;
};

const convertLocationFieldToText = (field: CustomField): CustomField[] => {
  const baseTextField = {
    required: field['required'],
    trackHistory: field['trackHistory'],
    trackTrending: field['trackTrending'],
    type: 'Text',
    length: 40,
    summaryFilterItems: [],
  };
  return ['Lat_', 'Long_'].map((prefix) => ({
    ...baseTextField,
    fullName: `${prefix}${field.fullName}`,
    label: `${prefix}${field.label}`,
  }));
};
