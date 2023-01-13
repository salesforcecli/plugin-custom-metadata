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
import { createRecord, getFileData } from '../../../shared/helpers/createUtil';
import { writeTypeFile, writeFieldFile } from '../../../shared/helpers/fileWriter';
import { describeObjFields, cleanQueryResponse, validCustomSettingType } from '../../../shared/helpers/metadataUtil';
import {
  validateAPIName,
  validateMetadataTypeName,
  isValidMetadataRecordName,
} from '../../../shared/helpers/validationUtil';
import { canConvert, createObjectXML, createFieldXML } from '../../../shared/templates/templates';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-custom-metadata', 'fromorg');

export interface CmdtGenerateResponse {
  outputDir: string;
  recordsOutputDir: string;
}
export default class Generate extends SfCommand<CmdtGenerateResponse> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly requiresProject = true;
  public static readonly aliases = ['force:cmdt:generate'];

  public static readonly flags = {
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    loglevel,
    // flag with a value (-n, --name=VALUE)
    'dev-name': Flags.string({
      char: 'n',
      required: true,
      summary: messages.getMessage('flags.dev-name.summary'),
      parse: async (input: string) => Promise.resolve(validateMetadataTypeName(input)),
      aliases: ['devname'],
    }),
    label: Flags.string({
      char: 'l',
      summary: messages.getMessage('flags.label.summary'),
    }),
    'plural-label': Flags.string({
      char: 'p',
      summary: messages.getMessage('flags.plural-label.summary'),
      aliases: ['plurallabel'],
    }),
    visibility: Flags.string({
      char: 'v',
      summary: messages.getMessage('flags.visibility.summary'),
      description: messages.getMessage('flags.visibility.description'),
      options: ['PackageProtected', 'Protected', 'Public'],
      default: 'Public',
    }),
    sobject: Flags.string({
      char: 's',
      required: true,
      summary: messages.getMessage('flags.sobject.summary'),
      parse: async (sobjectname: string) => Promise.resolve(validateAPIName(sobjectname)),
      aliases: ['sobjectname'],
    }),
    'ignore-unsupported': Flags.boolean({
      char: 'i',
      summary: messages.getMessage('flags.ignore-unsupported.summary'),
      description: messages.getMessage('flags.ignore-unsupported.description'),
      aliases: ['ignoreunsupported'],
    }),
    'type-output-directory': Flags.directory({
      char: 'd',
      summary: messages.getMessage('flags.type-output-directory.summary'),
      default: path.join('force-app', 'main', 'default', 'objects'),
      aliases: ['typeoutputdir'],
    }),
    'records-output-dir': Flags.directory({
      char: 'r',
      summary: messages.getMessage('flags.records-output-dir.summary'),
      default: path.join('force-app', 'main', 'default', 'customMetadata'),
      aliases: ['recordsoutputdir'],
    }),
  };

  public async run(): Promise<CmdtGenerateResponse> {
    const { flags } = await this.parse(Generate);
    const conn = flags['target-org'].getConnection(flags['api-version']);

    // use default target org connection to get object describe if no source is provided.
    const describeObj = await conn.metadata.read('CustomObject', flags.sobject);

    // throw error if the object doesnot exist(empty json as response from the describe call.)
    if (isEmpty(describeObj.fields)) {
      const errMsg = messages.getMessage('sobjectnameNoResultError', [flags.sobject]);
      throw new SfError(errMsg, 'sobjectnameNoResultError');
    }
    // check for custom setting
    if (describeObj.customSettingsType) {
      // if custom setting check for type and visibility
      if (!validCustomSettingType(describeObj)) {
        const errMsg = messages.getMessage('customSettingTypeError', [flags.sobject]);
        throw new SfError(errMsg, 'customSettingTypeError');
      }
    }

    const label = flags.label ?? flags['dev-name'];
    const pluralLabel = flags['plural-label'] ?? label;
    const { 'type-output-directory': outputDir, 'records-output-dir': recordsOutputDir } = flags;

    try {
      this.spinner.start('creating the CMDT object');
      // create custom metadata type
      const objectXML = createObjectXML({ label, pluralLabel }, flags.visibility);
      await writeTypeFile(fs, outputDir, flags['dev-name'], objectXML);

      this.spinner.status = 'creating the CMDT fields';

      // get all the field details before creating field metadata
      const fields = describeObjFields(describeObj)
        // added type check here to skip the creation of un supported fields
        .filter((f) => !flags['ignore-unsupported'] || canConvert(f['type']))
        .flatMap((f) =>
          // check for Geo Location fields before hand and create two different fields for longitude and latitude.
          f.type !== 'Location' ? [f] : convertLocationFieldToText(f)
        );
      // create custom metdata fields
      await Promise.all(
        fields.map((f) =>
          writeFieldFile(
            fs,
            path.join(outputDir, `${flags['dev-name']}__mdt`),
            f.fullName,
            createFieldXML(f, !flags['ignore-unsupported'])
          )
        )
      );

      this.spinner.status = 'creating the CMDT records';
      // if customMetadata folder does not exist, create it
      await fs.promises.mkdir(recordsOutputDir, { recursive: true });
      const fieldDirPath = path.join(outputDir, `${flags['dev-name']}__mdt`, 'fields');
      const fileNames = await fs.promises.readdir(fieldDirPath);
      const fileData = await getFileData(fieldDirPath, fileNames);

      // query records from source
      const sObjectRecords = await conn.query(getSoqlQuery(describeObj));
      await Promise.all(
        sObjectRecords.records.map((rec) => {
          const record = cleanQueryResponse(rec, describeObj);
          const lblName = rec['Name'] as string;
          const recordName = isValidMetadataRecordName(lblName) ? lblName : lblName.replace(/ +/g, '_');
          return createRecord({
            typename: flags['dev-name'],
            recordname: recordName,
            label: lblName,
            inputdir: outputDir,
            outputdir: recordsOutputDir,
            protected: flags.visibility !== 'Public',
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
