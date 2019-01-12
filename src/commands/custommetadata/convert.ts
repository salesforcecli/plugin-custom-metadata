import {core, flags, SfdxCommand} from '@salesforce/command';
import { createRecord, createTypeFile } from '../../lib/helper';

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
    objname: flags.string({char: 'n', description: messages.getMessage('objnameFlagDescription')}),
    visibility: flags.string({char: 'v', description: messages.getMessage('visibilityFlagDescription')})
};

  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = true;

  public async run(): Promise<core.AnyJson> {
    const objname = this.flags.objname;
    const visibility = this.flags.visibility;

    // this.org is guaranteed because requiresUsername=true, as opposed to supportsUsername
    const conn = this.org.getConnection();
    const query = `Select Name from ${objname}`;

    // The type we are querying for
    interface Record {
      Name: string;
    }

    // Query the org
    const result = await conn.query<Record>(query);

    if (!result.records || result.records.length <= 0) {
      throw new core.SfdxError(messages.getMessage('errorNoRecResults', [objname]));
    }

    let devName;
    if (objname.endsWith('__c')) {
        devName = objname.substring(0, objname.indexOf('__c')) + 'Type';
    } else {
        devName = objname + 'Type';
    }
    const label = devName;
    const plurallabel = devName;

    createTypeFile(core.fs, devName, label, plurallabel, visibility);

    // now let's create the records!
    for (const rec of result.records) {
        const recName = this.getCleanRecName(rec.Name);
        let recLabel = rec.Name;
        if (recLabel.length > 40) {
            recLabel = recLabel.substring(0,40);
        }
        createRecord(core.fs, devName, recName, recLabel, false, {});
    }
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
