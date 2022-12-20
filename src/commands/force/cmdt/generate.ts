/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'fs';
import * as path from 'path';
import {
  Flags,
  loglevel,
  orgApiVersionFlagWithDeprecations,
  requiredOrgFlagWithDeprecations,
  SfCommand,
} from '@salesforce/sf-plugins-core';
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

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-custom-metadata', 'generate');

interface CmdtGenerateResponse {
  outputDir: string;
  recordsOutputDir: string;
}
export default class Generate extends SfCommand<CmdtGenerateResponse> {
  public static readonly summary = messages.getMessage('commandDescription');
  public static readonly description = messages.getMessage('commandLongDescription');
  public static readonly requiresProject = true;

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

  public static readonly flags = {
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    loglevel,
    // flag with a value (-n, --name=VALUE)
    'dev-name': Flags.string({
      char: 'n',
      required: true,
      summary: messages.getMessage('devnameFlagDescription'),
      description: messages.getMessage('devnameFlagLongDescription'),
      parse: async (input: string) => Promise.resolve(validateMetadataTypeName(input)),
      aliases: ['devname'],
    }),
    label: Flags.string({
      char: 'l',
      summary: messages.getMessage('labelFlagDescription'),
      description: messages.getMessage('labelFlagLongDescription'),
    }),
    'plural-label': Flags.string({
      char: 'p',
      summary: messages.getMessage('plurallabelFlagDescription'),
      description: messages.getMessage('plurallabelFlagLongDescription'),
      aliases: ['plurallabel'],
    }),
    visibility: Flags.string({
      char: 'v',
      summary: messages.getMessage('visibilityFlagDescription'),
      description: messages.getMessage('visibilityFlagLongDescription'),
      options: ['PackageProtected', 'Protected', 'Public'],
      default: 'Public',
    }),
    sobject: Flags.string({
      char: 's',
      required: true,
      summary: messages.getMessage('sobjectnameFlagDescription'),
      description: messages.getMessage('sobjectnameFlagLongDescription'),
      parse: async (sobjectname: string) => Promise.resolve(validateAPIName(sobjectname)),
      aliases: ['sobjectname'],
    }),
    'ignore-unsupported': Flags.boolean({
      char: 'i',
      summary: messages.getMessage('ignoreUnsupportedFlagDescription'),
      description: messages.getMessage('ignoreUnsupportedFlagLongDescription'),
      aliases: ['ignoreunsupported'],
    }),
    'type-output-directory': Flags.directory({
      char: 'd',
      summary: messages.getMessage('typeoutputdirFlagDescription'),
      description: messages.getMessage('typeoutputdirFlagLongDescription'),
      default: path.join('force-app', 'main', 'default', 'objects'),
      aliases: ['typeoutputdir'],
    }),
    'records-output-dir': Flags.directory({
      char: 'r',
      summary: messages.getMessage('recordsoutputdirFlagDescription'),
      description: messages.getMessage('recordsoutputdirFlagLongDescription'),
      default: path.join('force-app', 'main', 'default', 'customMetadata'),
      aliases: ['recordsoutputdir'],
    }),
  };

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public async run(): Promise<CmdtGenerateResponse> {
    const { flags } = await this.parse(Generate);
    const conn = flags['target-org'].getConnection(flags['api-version']);

    // use default target org connection to get object describe if no source is provided.
    const describeObj = await conn.metadata.read('CustomObject', flags.sobject);

    // throw error if the object doesnot exist(empty json as response from the describe call.)
    if (isEmpty(describeObj.fields)) {
      const errMsg = messages.getMessage('sobjectnameNoResultError', [flags.sobjectname]);
      throw new SfError(errMsg, 'sobjectnameNoResultError');
    }
    // check for custom setting
    if (describeObj.customSettingsType) {
      // if custom setting check for type and visibility
      if (!validCustomSettingType(describeObj)) {
        const errMsg = messages.getMessage('customSettingTypeError', [flags.sobjectname]);
        throw new SfError(errMsg, 'customSettingTypeError');
      }
    }

    const visibility = flags.visibility;
    const label = flags.label ?? flags['dev-name'];
    const pluralLabel = flags['plural-label'] ?? label;
    const outputDir = flags['type-output-directory'];
    const recordsOutputDir = flags['records-output-dir'];

    try {
      this.spinner.start('creating the CMDT object');
      // create custom metadata type
      const templates = new Templates();
      const objectXML = templates.createObjectXML({ label, pluralLabel }, visibility);
      const fileWriter = new FileWriter();
      await fileWriter.writeTypeFile(fs, outputDir, flags['dev-name'], objectXML);

      this.spinner.status = 'creating the CMDT fields';

      // get all the field details before creating field metadata
      const fields = describeObjFields(describeObj)
        // added type check here to skip the creation of un supported fields
        .filter((f) => !flags['ignore-unsupported'] || templates.canConvert(f['type']))
        .flatMap((f) =>
          // check for Geo Location fields before hand and create two different fields for longitude and latitude.
          f.type !== 'Location' ? [f] : convertLocationFieldToText(f)
        );
      // create custom metdata fields
      await Promise.all(
        fields.map((f) =>
          fileWriter.writeFieldFile(
            fs,
            path.join(outputDir, `${flags['dev-name']}__mdt`),
            f.fullName,
            templates.createFieldXML(f, !flags['ignore-unsupported'])
          )
        )
      );

      this.spinner.status = 'creating the CMDT records';
      const createUtil = new CreateUtil();
      // if customMetadata folder does not exist, create it
      await fs.promises.mkdir(recordsOutputDir, { recursive: true });
      const fieldDirPath = path.join(outputDir, `${flags['dev-name']}__mdt`, 'fields');
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
            typename: flags['dev-name'],
            recordname: recordName,
            label: lblName,
            inputdir: outputDir,
            outputdir: recordsOutputDir,
            protected: visibility !== 'Public',
            varargs: record,
            fileData,
            ignorefields: flags['ignore-unsupported'],
          });
        })
      );

      this.spinner.stop('custom metadata type and records creation in completed');
      this.log(
        `Congrats! Created a ${flags['dev-name']} custom metadata type with ${sObjectRecords.records.length} records!`
      );
    } catch (e) {
      const targetDir = `${outputDir}${flags['dev-name']}__mdt`;
      // dir might not exist if we never got to the creation step
      if (fs.existsSync(targetDir)) {
        await fs.promises.rm(targetDir, { recursive: true });
      }
      await Promise.all(
        (await fs.promises.readdir(recordsOutputDir))
          .filter((f) => f.startsWith(flags['dev-name']))
          .map((f) => fs.promises.unlink(path.join(recordsOutputDir, f)))
      );

      this.spinner.stop('generate command failed to run');
      const errMsg = messages.getMessage('generateError', [e instanceof Error ? e.message : 'unknown error']);
      throw new SfError(errMsg, 'generateError');
    }

    return { outputDir, recordsOutputDir };
  }
}

const getSoqlQuery = (describeResult: CustomObject): string => {
  const fieldNames = describeResult.fields.map((field) => field.fullName).join(',');
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
