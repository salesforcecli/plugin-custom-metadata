import { core, flags, SfdxCommand } from '@salesforce/command';
import { AnyJson } from '@salesforce/ts-types';
import { CreateUtil } from '../../../lib/helpers/createUtil';
import { FileWriter } from '../../../lib/helpers/fileWriter';
import { MetdataUtil  } from '../../../lib/helpers/metadatautil';
import { Record } from '../../../lib/interfaces/record';
import { Templates } from '../../../lib/templates/templates';

// Initialize Messages with the current plugin directory
core.Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = core.Messages.loadMessages('custommetadata', 'convert');

export default class Convert extends SfdxCommand {

  public static description = messages.getMessage('commandDescription');

  public static examples = [
  `$ sfdx custommetadata:convert --objname ConfigObject__c --visibility Public -u myOrg@org.com
  Congrats! Created a ConfigObject__mdt type with 32 records!
  `
  ];

  public static args = [{name: 'file'}];

  protected static flagsConfig = {
    // flag with a value (-n, --name=VALUE)
    typename: flags.string({char: 'n', description: messages.getMessage('typenameFlagDescription')}),
    label: flags.string({char: 'l', description: messages.getMessage('labelFlagDescription')}),
    plurallabel: flags.string({char: 'p', description: messages.getMessage('plurallabelFlagDescription')}),
    visibility: flags.string({char: 'v', description: messages.getMessage('visibilityFlagDescription')}),
    sobjectname: flags.string({char: 's', description: messages.getMessage('sobjectnameFlagDescription')}),
    sourceusername: flags.string({char: 'x', description: messages.getMessage('sourceusernameFlagDescription')}),
    deploy: flags.string({char: 'd', description: messages.getMessage('deployFlagDescription')}),
    ignore: flags.string({char: 'i', description: messages.getMessage('ignoreFlagDescription')}),
    loglevel: flags.string({char: 'l', description: messages.getMessage('loglevelFlagDescription')}),
    inputdir: flags.directory({char: 'n', description: messages.getMessage('inputDirectoryFlagDescription')}),
    outputdir: flags.directory({char: 'o', description: messages.getMessage('outputDirectoryFlagDescription')})
};

  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = true;

  public async run(): Promise<AnyJson> {
    const objname = this.flags.sobjectname;
    const visibility = this.flags.visibility;
    const inputdir = this.flags.inputdir || 'force-app/main/default/objects';
    const outputdir = this.flags.outputdir || 'force-app/main/default/customMetadata';

    // this.org is guaranteed because requiresUsername=true, as opposed to supportsUsername
    const conn = this.org.getConnection();
    const query = `Select Name from ${objname}`;
    const metadatautil = new MetdataUtil();
    const createUtil = new CreateUtil();

    const describeObj = await metadatautil.describeObj(objname, conn);
    const fieldObj = await metadatautil.queryRecords(objname, conn);
    const describeField = metadatautil.describeField(describeObj, 'Name');
    const describeAllFields = metadatautil.describeObjFields(describeObj);
    const isvalidObjectType = metadatautil.validCustomSettingType(describeObj);
    console.log(describeObj);
    console.log(fieldObj);
    console.log(describeField);
    console.log(describeAllFields);
    console.log(isvalidObjectType);

    // Query the org
    const result = await conn.query<Record>(query);

    if (!result.records || result.records.length <= 0) {
      throw new core.SfdxError(messages.getMessage('errorNoRecResults', [objname]));
    }

    let typename;
    if (objname.endsWith('__c')) {
        typename = objname.substring(0, objname.indexOf('__c')) + 'Type';
    } else {
        typename = objname + 'Type';
    }
    const label = typename;
    const plurallabel = typename;
    const templates = new Templates();
    const objectXML = templates.createObjectXML({label, plurallabel}, visibility);
    const fileWriter = new FileWriter();
    await fileWriter.writeTypeFile(core.fs, '', typename, objectXML);

    // now let's create the records!
    for (const rec of result.records) {
        const recname = this.getCleanRecName(rec.Name);
        let label = rec.Name;

        if (label.length > 40) {
            label = label.substring(0, 40);
        }

        await createUtil.createRecord({
          typename,
          recname,
          label,
          inputdir,
          outputdir,
          protection: false
        });
    }

    this.ux.log(messages.getMessage('successResponse', [typename, result.records.length]));

    return {};
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
