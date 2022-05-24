/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'fs';
import { flags, SfdxCommand } from '@salesforce/command';
import {
  Aliases,
  AuthInfo,
  Connection,
  SfError,
  Messages,
} from '@salesforce/core';
import { isEmpty } from '@salesforce/kit';
import { AnyJson, asString, ensureJsonArray } from '@salesforce/ts-types';
import { CreateUtil } from '../../../lib/helpers/createUtil';
import { FileWriter } from '../../../lib/helpers/fileWriter';
import { MetadataUtil } from '../../../lib/helpers/metadataUtil';
import { ValidationUtil } from '../../../lib/helpers/validationUtil';
import { Templates } from '../../../lib/templates/templates';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages(
  '@salesforce/plugin-custom-metadata',
  'generate'
);

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
    }),
    ignoreunsupported: flags.boolean({
      char: 'i',
      description: messages.getMessage('ignoreUnsupportedFlagDescription'),
      longDescription: messages.getMessage(
        'ignoreUnsupportedFlagLongDescription'
      ),
    }),
    typeoutputdir: flags.directory({
      char: 'd',
      description: messages.getMessage('typeoutputdirFlagDescription'),
      longDescription: messages.getMessage('typeoutputdirFlagLongDescription'),
      default: 'force-app/main/default/objects/',
    }),
    recordsoutputdir: flags.directory({
      char: 'r',
      description: messages.getMessage('recordsoutputdirFlagDescription'),
      longDescription: messages.getMessage(
        'recordsoutputdirFlagLongDescription'
      ),
      default: 'force-app/main/default/customMetadata/',
    }),
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = true;

  public async run(): Promise<AnyJson> {
    // this.org is guaranteed because requiresUsername=true, as opposed to supportsUsername
    const conn = this.org.getConnection();

    // to validate different flags provided by the user
    const validator = new ValidationUtil();

    const objname = this.flags.sobjectname;
    const cmdttype = this.flags.devname;
    const sourceuser = this.flags.targetusername;
    const ignoreFields = this.flags.ignoreunsupported;

    let username: string;
    let sourceOrgConn: Connection;
    let describeObj;
    // check whether username or alias is provided as targetusername
    if (sourceuser) {
      if (sourceuser.substr(sourceuser.length - 4) !== '.com') {
        username = await Aliases.fetch(sourceuser); // if alias is provided get the corresponding username
        if (username === undefined) {
          throw new SfError(
            messages.getMessage('sourceusernameError', [sourceuser])
          )
        }
      } else {
        username = sourceuser;
      }
    }
    if (username) {
      try {
        // connect to source org if source user name provided
        sourceOrgConn = await Connection.create({
          authInfo: await AuthInfo.create({ username }),
        });
      } catch (err) {
        const errMsg = messages.getMessage('sourceuserAuthenticationError', [
          sourceuser,
          err.message,
        ]);
        throw new SfError(errMsg, 'sourceuserAuthenticationError');
      }
    }

    if (!validator.validateAPIName(objname)) {
      throw new SfError(
        messages.getMessage('sobjectnameFlagError', [objname])
      )
    }

    let devName;
    if (!validator.validateMetadataTypeName(cmdttype)) {
      throw new SfError(
        messages.getMessage('typenameFlagError', [cmdttype])
      )
    }

    if (cmdttype.endsWith('__mdt') || cmdttype.endsWith('__MDT')) {
      devName = cmdttype.substring(0, cmdttype.indexOf('__mdt'));
    } else {
      devName = cmdttype;
    }

    let metadataUtil;
    // get defined only if there is source username provided
    if (!sourceOrgConn) {
      metadataUtil = new MetadataUtil(conn);
    } else {
      metadataUtil = new MetadataUtil(sourceOrgConn);
    }

    // use default target org connection to get object describe if no source is provided.
    describeObj = await metadataUtil.describeObj(objname);

    // throw error if the object doesnot exist(empty json as response from the describe call.)
    if (isEmpty(describeObj)) {
      const errMsg = messages.getMessage('sobjectnameNoResultError', [objname]);
      throw new SfError(errMsg, 'sobjectnameNoResultError');
    }
    // check for custom setting
    if (describeObj['customSettingsType'] !== undefined) {
      // if custom setting check for type and visbility
      if (!metadataUtil.validCustomSettingType(describeObj)) {
        const errMsg = messages.getMessage('customSettingTypeError', [objname]);
        throw new SfError(errMsg, 'customSettingTypeError');
      }
    }

    const visibility = this.flags.visibility || 'Public';
    const label = this.flags.label || devName;
    const pluralLabel = this.flags.plurallabel || label;
    const outputDir =
      this.flags.typeoutputdir || 'force-app/main/default/objects/';
    const recordsOutputDir =
      this.flags.recordsoutputdir || 'force-app/main/default/customMetadata';

    try {
      this.ux.startSpinner('custom metadata generation in progress');
      // create custom metadata type
      const templates = new Templates();
      const objectXML = templates.createObjectXML(
        { label, pluralLabel },
        visibility
      );
      const fileWriter = new FileWriter();
      await fileWriter.writeTypeFile(fs, outputDir, devName, objectXML);

      // get all the field details before creating feild metadata
      const describeAllFields = metadataUtil.describeObjFields(describeObj);

      let sObjectRecords;
      // query records from source
      sObjectRecords = await metadataUtil.queryRecords(describeObj);
      if (sObjectRecords.errorCode && sObjectRecords.errorCode !== null) {
        const errMsg = messages.getMessage('queryError', [
          objname,
          asString(sObjectRecords.errorMsg),
        ]);
        throw new SfError(errMsg, 'queryError');
      }

      // check for Geo Location fields before hand and create two different fields for longitude and latitude.
      const fields = ensureJsonArray(describeAllFields);
      fields.map((field) => {
        if (field['type'] === 'Location') {
          const lat: AnyJson = {
            fullName: 'Lat_' + field['fullName'],
            label: 'Lat ' + field['label'],
            required: field['required'],
            trackHistory: field['trackHistory'],
            trackTrending: field['trackTrending'],
            type: 'Text',
            length: '40',
          };
          fields.push(lat);

          const long: AnyJson = {
            fullName: 'Long_' + field['fullName'],
            label: 'Long_' + field['label'],
            required: field['required'],
            trackHistory: field['trackHistory'],
            trackTrending: field['trackTrending'],
            type: 'Text',
            length: '40',
          };
          fields.push(long);
        }
      });

      // create custom metdata fields
      for (const field of fields) {
        // added type check here to skip the creation of geo location field  and un supported fields as we are adding it as lat and long field above.
        if (
          (templates.canConvert(field['type']) || !ignoreFields) &&
          field['type'] !== 'Location'
        ) {
          const recordname = field['fullName'];
          const fieldXML = templates.createFieldXML(field, !ignoreFields);
          const targetDir = `${outputDir}${devName}__mdt`;
          await fileWriter.writeFieldFile(fs, targetDir, recordname, fieldXML);
        }
      }

      const createUtil = new CreateUtil();
      // if customMetadata folder does not exist, create it
      await fs.promises.mkdir(recordsOutputDir, {recursive:true});
      const security: boolean = visibility !== 'Public';

      const typename = devName;

      const fieldDirPath = `${fileWriter.createDir(
        outputDir
      )}${typename}__mdt/fields`;
      const fileNames = await fs.promises.readdir(fieldDirPath);
      const fileData = await createUtil.getFileData(fieldDirPath, fileNames);

      for (const rec of sObjectRecords.records) {
        const record = metadataUtil.cleanQueryResponse(rec, describeObj);
        const lblName = rec['Name'];
        let recordName = rec['Name'];
        if (!validator.validateMetadataRecordName(rec['Name'])) {
          recordName = recordName.replace(/ +/g, '_');
        }
        await createUtil.createRecord({
          typename,
          recordname: recordName,
          label: lblName,
          inputdir: outputDir,
          outputdir: recordsOutputDir,
          protected: security,
          varargs: record,
          fileData,
          ignorefields: ignoreFields,
        });
      }
      this.ux.stopSpinner(
        'custom metadata type and records creation in completed'
      );
      this.ux.log(
        `Congrats! Created a ${devName} custom metadata type with ${sObjectRecords.records.length} records!`
      );
    } catch (e) {
      await fs.promises.rm(`${outputDir}${devName}__mdt`, {recursive:true});
      const fileNames = await fs.promises.readdir(recordsOutputDir);
      for (const file of fileNames) {
        if (file.startsWith(devName)) {
          try {
            await fs.promises.unlink(`${recordsOutputDir}/${file}`);
          } catch (e) {
            this.ux.log(e.message);
          }
        }
      }
      this.ux.stopSpinner('generate command failed to run');
      const errMsg = messages.getMessage('generateError', [e.message]);
      throw new SfError(errMsg, 'generateError');
    }

    return { outputDir, recordsOutputDir };
  }
}
