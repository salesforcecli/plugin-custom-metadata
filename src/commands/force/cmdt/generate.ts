import { core, flags, SfdxCommand } from '@salesforce/command';
import { Aliases, SfdxError } from '@salesforce/core';
import { isEmpty } from '@salesforce/kit';
import { AnyJson, ensureJsonArray } from '@salesforce/ts-types';
import { isNullOrUndefined } from 'util';
import { FileWriter } from '../../../lib/helpers/fileWriter';
import { createRecord } from '../../../lib/helpers/helper';
import { MetdataUtil  } from '../../../lib/helpers/metadataUtil';
import { ValidationUtil } from '../../../lib/helpers/validationUtil';
import { Templates } from '../../../lib/templates/templates';

// Initialize Messages with the current plugin directory
core.Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = core.Messages.loadMessages('custommetadata', 'generate');

export default class generate extends SfdxCommand {

  public static description = messages.getMessage('commandDescription');

  public static examples = [
  `$ sfdx custommetadata:generate --objname ConfigObject__c --visibility Public -u myOrg@org.com
  Congrats! Created a ConfigObject__mdt type with 32 records!
  `
  ];

  public static args = [{name: 'file'}];

  protected static flagsConfig = {
    // flag with a value (-n, --name=VALUE)
    typename: flags.string({char: 'n', required: true, description: messages.getMessage('typenameFlagDescription')}),
    label: flags.string({char: 'l', description: messages.getMessage('labelFlagDescription')}),
    plurallabel: flags.string({char: 'p', description: messages.getMessage('plurallabelFlagDescription')}),
    visibility: flags.string({char: 'v', description: messages.getMessage('visibilityFlagDescription')}),
    sobjectname: flags.string({char: 's', required: true, description: messages.getMessage('sobjectnameFlagDescription')}),
    sourceusername: flags.string({char: 'x', description: messages.getMessage('sourceusernameFlagDescription')}),
    deploy: flags.string({char: 'd', description: messages.getMessage('deployFlagDescription')}),
    ignore: flags.string({char: 'i', description: messages.getMessage('ignoreFlagDescription')}),
    loglevel: flags.string({char: 'l', description: messages.getMessage('loglevelFlagDescription')})
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

    // utility to make different calls to org like describe, query etc.,
    const metadatautil = new MetdataUtil();
    const objname = this.flags.sobjectname;
    const cmdttype = this.flags.typename;
    const sourceuser = this.flags.sourceusername;

    let username: string;
    let sourceOrgConn: core.Connection;
    let describeObj;
    let sObjectRecords;
    // check whether username or alias is provided as sourceusername
    if (!isNullOrUndefined(sourceuser)) {
        if (sourceuser.substr(sourceuser.length - 4) !== '.com') {

            username = await Aliases.fetch(sourceuser); // if alias is provided get the corresponding username
            if (username === undefined) {
                throw SfdxError.create('custommetadata', 'generate', 'sourceusernameError', [sourceuser]);
            }
        } else {
            username = sourceuser;
        }
    }
    if (!isNullOrUndefined(username)) {
        try {
            // connect to source org if source user name provided
            sourceOrgConn = await core.Connection.create({
                authInfo: await core.AuthInfo.create({ username })
            });
            describeObj = await metadatautil.describeObj(objname, sourceOrgConn);
            sObjectRecords = await metadatautil.queryRecords(objname, sourceOrgConn);
        } catch (err) {
            const errMsg = messages.getMessage('sourceuserAuthenticationError', [sourceuser, err.message]);
            throw new SfdxError(errMsg, 'sourceuserAuthenticationError');
        }
    } else {
        // use default target org connection to get object describe if no source is provided.
        if (isNullOrUndefined(describeObj)) {
            describeObj = await metadatautil.describeObj(objname, conn);
            sObjectRecords = await metadatautil.queryRecords(objname, conn);
        }
    }
    const customSettingType = describeObj['customSettingsType'];
    if (customSettingType !== undefined && customSettingType === 'Hierarchy') {
        const errMsg = messages.getMessage('customSettingTypeError', [objname]);
        throw new SfdxError(errMsg, 'customSettingTypeError');
    }
    if (!metadatautil.validCustomSettingType(describeObj)) {
        const errMsg = messages.getMessage('customSettingTypeError', [objname]);
        throw new SfdxError(errMsg, 'customSettingTypeError');
    }
    const visibility = this.flags.visibility || 'Public';
    let devName;
    if (!isNullOrUndefined(objname)) {
        if (!validator.validateAPIName(objname)) {
            throw SfdxError.create('custommetadata', 'generate', 'sobjectnameFlagError', [objname]);
        } else {
            devName = objname.substring(0, objname.indexOf('__c')) + 'Type';
        }
    } else {
        throw SfdxError.create('custommetadata', 'generate', 'sobjectnameFlagError', [objname]);
    }

    if (!validator.validateMetadataTypeName(cmdttype)) {
        throw  SfdxError.create('custommetadata', 'generate', 'typenameFlagError', [cmdttype]);
    }
    const label = this.flags.label || devName;
    const plurallabel = this.flags.plurallabel || devName;

    try {
        const describeField = metadatautil.describeField(describeObj, 'Name');
        const describeAllFields = metadatautil.describeObjFields(describeObj);
        const isvalidObjectType = metadatautil.validCustomSettingType(describeObj);
        console.log(describeObj);
        console.log(sObjectRecords);
        console.log(describeField);
        console.log(describeAllFields);
        console.log(isvalidObjectType);
        console.log(cmdttype);

        // create custom metadata type
        const templates = new Templates();
        const objectXML = templates.createObjectXML({label, labelPlural:plurallabel}, visibility);
        const fileWriter = new FileWriter();
        await fileWriter.writeTypeFile(core.fs, '', devName, objectXML);

        // create custom metdata fields
        const allFields = ensureJsonArray(describeAllFields);
        await allFields.map(field => {
            const recName = this.getCleanRecName(field['fullName']);
            const fieldXML = templates.createFieldXML(field, recName);
            fileWriter.writeFieldFile(core.fs, '', recName, fieldXML);
            console.log(recName);
            let recLabel = recName;
            if (recLabel.length > 40) {
                recLabel = recLabel.substring(0, 40);
            }
        });

        // create custom metadata records
    } catch (e) {
        const errMsg = messages.getMessage('generateError', [e.message]);
        throw new SfdxError(errMsg, 'generateError');
    }
    // The type we are querying for
    interface Record {
      Name: string;
    }

    const query = `Select Name from ${objname}`;

    // Query the org
    const result = await conn.query<Record>(query);

    if (isEmpty(sObjectRecords)) {
      throw SfdxError.create('custommetadata', 'generate', 'errorNoRecResults', [objname]);
    }

    // now let's create the records!
    sObjectRecords['records'].map( record => {
        const recName = this.getCleanRecName(record.Name);
        let recLabel = record.Name;
        if (recLabel.length > 40) {
            recLabel = recLabel.substring(0, 40);
        }
        createRecord(core.fs, devName, recName, recLabel, false, {});
    });
    /*
    for (const rec of result.records) {
        const recName = this.getCleanRecName(rec.Name);
        let recLabel = rec.Name;
        if (recLabel.length > 40) {
            recLabel = recLabel.substring(0, 40);
        }
        createRecord(core.fs, devName, recName, recLabel, false, {});
    }*/
    this.ux.log(`Congrats! Created a ${devName}__mdt type with ${result.records.length} records!`);
    return {  };
  }

  private getCleanRecName(recName: string) {
    const charArr = recName.split('');
    // replace special characters
    let cleanName = '';
    for (let letter of charArr) {
        if (!(letter >= 'a' && letter <= 'z') && !(letter >= 'A' && letter <= 'Z')) {
            letter = '_';
        }
        // now only tack that letter on the end if it won't create consecutive underscores
        if (letter !== '_' || !cleanName.endsWith('_')) {
            cleanName += letter;
        }
    }
    // if the last letter is an underscore, rip that sucker clean off
    if (cleanName.endsWith('_')) {
        cleanName = cleanName.substring(0, cleanName.length - 1);
    }
    // if the name is too long, just truncate it
    if (cleanName.length > 40) {
        cleanName = cleanName.substring(0, 40);
    }
    return cleanName;
  }
}
