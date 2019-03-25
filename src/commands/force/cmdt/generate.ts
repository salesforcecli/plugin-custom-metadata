import { core, flags, SfdxCommand } from '@salesforce/command';
import { Aliases, SfdxError } from '@salesforce/core';
import { isEmpty } from '@salesforce/kit';
import { AnyJson, ensureJsonArray } from '@salesforce/ts-types';
import { isNullOrUndefined } from 'util';
import { CreateUtil } from '../../../lib/helpers/createUtil';
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
  '"$ sfdx force:cmdt:generate --devname MyCMDT --sobjectname MySourceObject__c ',
  '"$ sfdx force:cmdt:generate --devname MyCMDT --sobjectname MySourceObject__c  --ignoreunsupported --sourceusername \'alias or the email of the source org\'',
  '"$ sfdx force:cmdt:generate --devname MyCMDT --sobjectname SourceCustomObject__c  --visibility Protected',
  '"$ sfdx force:cmdt:generate --devname MyCMDT --label \'My CMDT\' --plurallabel \'My CMDTs\' --sobjectname SourceCustomSetting__c  --visibility Protected',
  '"$ sfdx force:cmdt:generate --devname MyCMDT --sobjectname SourceCustomSetting__c  --typeoutputdir \'your desired Path for custom metadata\'',
  '"$ sfdx force:cmdt:generate --devname MyCMDT --sobjectname SourceCustomSetting__c  --recordsoutputdir \'your desired Path for custom metadata Records\''
  ];

  public static args = [{name: 'file'}];

  protected static flagsConfig = {
    // flag with a value (-n, --name=VALUE)
    devname: flags.string({char: 'n', required: true, description: messages.getMessage('devnameFlagDescription')}),
    label: flags.string({char: 'l', description: messages.getMessage('labelFlagDescription')}),
    plurallabel: flags.string({char: 'p', description: messages.getMessage('plurallabelFlagDescription')}),
    visibility: flags.enum({char: 'v', description: messages.getMessage('visibilityFlagDescription'),  options: ['Protected', 'Public']}),
    sobjectname: flags.string({char: 's', required: true, description: messages.getMessage('sobjectnameFlagDescription')}),
    sourceusername: flags.string({char: 'x', description: messages.getMessage('sourceusernameFlagDescription')}),
    ignoreunsupported: flags.boolean({char: 'i', description: messages.getMessage('ignoreUnsupportedFlagDescription')}),
    typeoutputdir: flags.directory({char: 'd', description: messages.getMessage('outputDirectoryFlagDescription')}),
    recordsoutputdir: flags.directory({char: 'r', description: messages.getMessage('recordsoutputDirectoryFlagDescription')}),
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
    const ignoreFields = this.flags.ignoreunsupported;

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

    if (!validator.validateAPIName(objname)) {
        throw SfdxError.create('custommetadata', 'generate', 'sobjectnameFlagError', [objname]);
    }

    let devName;
    if (!validator.validateMetadataTypeName(cmdttype)) {
        throw  SfdxError.create('custommetadata', 'generate', 'typenameFlagError', [cmdttype]);
    }
    if ( cmdttype.endsWith('__mdt') || cmdttype.endsWith('__MDT')) {
        devName = cmdttype.substring(0, cmdttype.indexOf('__mdt'));
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
    const pluralLabel = this.flags.plurallabel || devName;
    const outputDir = this.flags.typeoutputdir || 'force-app/main/default/objects/';
    const recordsOutputDir = this.flags.recordsoutputdir || 'force-app/main/default/customMetadata';

    try {
        this.ux.startSpinner('custom metadata generation in progress');
        // create custom metadata type
        const templates = new Templates();
        const objectXML = templates.createObjectXML({label, pluralLabel}, visibility);
        const fileWriter = new FileWriter();
        await fileWriter.writeTypeFile(core.fs, outputDir, devName, objectXML);

        // get all the field details before creating feild metadata
        const describeAllFields = metadataUtil.describeObjFields(describeObj);

        let sObjectRecords;
        // query records from source
        sObjectRecords = await metadataUtil.queryRecords(describeObj);

        // check for Geo Location fields before hand and create two different fields for longitude and latitude.
        const fields = ensureJsonArray(describeAllFields);
        fields.map(field => {
            if (field['type'] === 'Location') {
                const lat: AnyJson = {
                    fullName : 'Lat_' + field['fullName'],
                    label: 'Lat ' + field['label'],
                    required: field['required'],
                    trackHistory: field['trackHistory'],
                    trackTrending: field['trackTrending'],
                    type: 'Text',
                    length: '40'
                };
                fields.push(lat);

                const long: AnyJson = {
                    fullName : 'Long_' + field['fullName'],
                    label: 'Long_' + field['label'],
                    required: field['required'],
                    trackHistory: field['trackHistory'],
                    trackTrending: field['trackTrending'],
                    type: 'Text',
                    length: '40'
                };
                fields.push(long);
            }
        });

        // create custom metdata fields
        await fields.map(async field => {
            // added type check here to skip the creation of geo location field  and un supported fields as we are adding it as lat and long field above.
            if ((templates.canConvert(field['type']) || !ignoreFields) && field['type'] !== 'Location') {
                    const recName = field['fullName'];
                    const fieldXML = templates.createFieldXML(field, recName);
                    const targetDir = `${outputDir}${devName}__mdt`;
                    await fileWriter.writeFieldFile(core.fs, targetDir, recName, fieldXML);
            }
        });

        const createUtil = new CreateUtil();
        // if customMetadata folder does not exist, create it
        await core.fs.mkdirp(recordsOutputDir);
        const security: boolean = (visibility === 'Protected');

        for (const rec of sObjectRecords.records) {
            let typename = devName;
            if (typename.endsWith('__mdt')) {
                typename = typename.substring(0, typename.indexOf('__mdt'));
            }

            const fieldDirPath = `${fileWriter.createDir(outputDir)}${typename}__mdt/fields`;
            const fileNames = await core.fs.readdir(fieldDirPath);
            const fileData = await createUtil.getFileData(fieldDirPath, fileNames);
            const record = metadataUtil.cleanQueryResponse(rec);
            const lblName = rec['Name'];
            let recordName = rec['Name'];
            if (!validator.validateMetadataRecordName(rec['Name'])) {
                recordName = recordName.replace(/ +/g, '_');
            }
            await createUtil.createRecord({
                typename,
                recname: recordName,
                label: lblName,
                inputdir: outputDir,
                outputdir: recordsOutputDir,
                protection: security,
                varargs: record,
                fileData,
                ignorefields: ignoreFields
            });
        }
        this.ux.stopSpinner('custom metadata type and records creation in completed');
        this.ux.log(`Congrats! Created a ${devName} custom metadata type with ${sObjectRecords.records.length} records!`);
    } catch (e) {
        await core.fs.remove(`${outputDir}${devName}__mdt`);
        const fileNames = await core.fs.readdir(recordsOutputDir);
        for (const file of fileNames) {
            if (file.startsWith(devName)) {
               try {
                   await core.fs.unlink(`${recordsOutputDir}/${file}`);
               } catch (e) {
                    this.ux.log(e.message);
               }
            }
        }
        this.ux.stopSpinner('generate command failed to run');
        const errMsg = messages.getMessage('generateError', [e.message]);
        throw new SfdxError(errMsg, 'generateError');
    }

    return { outputDir, recordsOutputDir };

  }
}
