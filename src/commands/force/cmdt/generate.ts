import { core, flags, SfdxCommand } from '@salesforce/command';
import { Aliases, SfdxError } from '@salesforce/core';
import { isEmpty } from '@salesforce/kit';
import { AnyJson, ensureJsonArray } from '@salesforce/ts-types';
import { isNullOrUndefined } from 'util';
import { FileWriter } from '../../../lib/helpers/fileWriter';
import { MetadataUtil } from '../../../lib/helpers/metadataUtil';
import { ValidationUtil } from '../../../lib/helpers/validationUtil';
import { Templates } from '../../../lib/templates/templates';

// Initialize Messages with the current plugin directory
core.Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = core.Messages.loadMessages('custommetadata', 'generate');

export default class Generate extends SfdxCommand {

  public static description = messages.getMessage('commandDescription');

  public static examples = [
  `"$ sfdx cmdt:generate ---devName ConfigObjectmeta --label Config Object meta --plurallabel Config Object meta --sobjectname ConfigObject__c   --sourceusername SourceOrg
  Congrats! Created a ConfigObjectmeta__mdt type with 32 records!"
  `
  ];

  public static args = [{name: 'file'}];

  protected static flagsConfig = {
    // flag with a value (-n, --name=VALUE)
    devname: flags.string({char: 'n', required: true, description: messages.getMessage('devnameFlagDescription')}),
    label: flags.string({char: 'l', description: messages.getMessage('labelFlagDescription')}),
    plurallabel: flags.string({char: 'p', description: messages.getMessage('plurallabelFlagDescription')}),
    visibility: flags.string({char: 'v', description: messages.getMessage('visibilityFlagDescription')}),
    sobjectname: flags.string({char: 's', required: true, description: messages.getMessage('sobjectnameFlagDescription')}),
    sourceusername: flags.string({char: 'x', description: messages.getMessage('sourceusernameFlagDescription')}),
    deploy: flags.string({char: 'd', description: messages.getMessage('deployFlagDescription')}),
    ignoreunsupported: flags.string({char: 'i', description: messages.getMessage('ignoreUnsupportedFlagDescription')}),
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

    const objname = this.flags.sobjectname;
    const cmdttype = this.flags.devname;
    const sourceuser = this.flags.sourceusername;

    let username: string;
    let sourceOrgConn: core.Connection;
    let describeObj;
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
        } catch (err) {
            const errMsg = messages.getMessage('sourceuserAuthenticationError', [sourceuser, err.message]);
            throw new SfdxError(errMsg, 'sourceuserAuthenticationError');
        }
    }
    let devName;
    if (!isNullOrUndefined(objname)) {
        if (!validator.validateAPIName(objname)) {
            throw SfdxError.create('custommetadata', 'generate', 'sobjectnameFlagError', [objname]);
        } else if (objname.indexOf('__c')) {
            devName = objname.substring(0, objname.indexOf('__c')) + 'Type';
        } else {
            devName = objname + 'Type';
        }
    } else {
        throw SfdxError.create('custommetadata', 'generate', 'sobjectnameFlagError', [objname]);
    }

    if (!validator.validateMetadataTypeName(cmdttype)) {
        throw  SfdxError.create('custommetadata', 'generate', 'typenameFlagError', [cmdttype]);
    }
    const metadataUtil = new MetadataUtil(conn);
    // get defined only if there is source username provided
    const srcMetadataUtil = new MetadataUtil(sourceOrgConn);
    if (!sourceOrgConn) {
        // use default target org connection to get object describe if no source is provided.
        describeObj = await metadataUtil.describeObj(objname);
    } else {
        // use default target org connection to get object describe if no source is provided.
        describeObj = await srcMetadataUtil.describeObj(objname);
    }
    // throw error if the object doesnot exist(empty json as response from the describe call.)
    if (isEmpty(describeObj)) {
        const errMsg = messages.getMessage('sobjectnameNoResultError', [objname]);
        throw new SfdxError(errMsg, 'sobjectnameNoResultError');
    }
    // check for custom setting
    if (describeObj['customSettingsType'] !== undefined) {
        // if custom setting check for type and visbility
        if (!metadataUtil.validCustomSettingType(describeObj)) {
            const errMsg = messages.getMessage('customSettingTypeError', [objname]);
            throw new SfdxError(errMsg, 'customSettingTypeError');
        }
    }

    const visibility = this.flags.visibility || 'Public';
    const label = this.flags.label || devName;
    const plurallabel = this.flags.plurallabel || devName;

    try {
        // create custom metadata type
        const templates = new Templates();
        const objectXML = templates.createObjectXML({label, labelPlural: plurallabel}, visibility);
        const fileWriter = new FileWriter();
        await fileWriter.writeTypeFile(core.fs, '', devName, objectXML);

        // get all the field details before creating feild metadata
        const describeAllFields = metadataUtil.describeObjFields(describeObj);

        // create custom metdata fields
        const allFields = ensureJsonArray(describeAllFields);
        await allFields.map(async field => {
            const recName = this.getCleanRecName(field['fullName']);
            const fieldXML = templates.createFieldXML(field, recName);
            // need to figure out how to get the directory of the custom metdata created above
            await fileWriter.writeFieldFile(core.fs, '', recName, fieldXML);
            console.log(recName);
            let recLabel = recName;
            if (recLabel.length > 40) {
                recLabel = recLabel.substring(0, 40);
            }
        });
        let sObjectRecords;
        // query records from source
        if (!isEmpty(describeObj)) {
            if (!sourceOrgConn) {
            sObjectRecords = await metadataUtil.queryRecords(describeObj);
            console.log(sObjectRecords);
            } else {
                sObjectRecords = await srcMetadataUtil.queryRecords(describeObj);
                console.log(sObjectRecords);
            }
        } else {
            const errMsg = messages.getMessage('sobjectnameNoResultError', [objname]);
            throw new SfdxError(errMsg, 'sobjectnameNoResultError');
        }

        // create custom metadata records
        // TO DO
    } catch (e) {
        const errMsg = messages.getMessage('generateError', [e.message]);
        throw new SfdxError(errMsg, 'generateError');
    }

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
