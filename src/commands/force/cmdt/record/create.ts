import { core, flags, SfdxCommand } from '@salesforce/command';
import { AnyJson } from '@salesforce/ts-types';
import { parseString } from 'xml2js';
import { CreateUtil } from '../../../../lib/helpers/createUtil';
import { FileWriter } from '../../../../lib/helpers/fileWriter';

// Initialize Messages with the current plugin directory
core.Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = core.Messages.loadMessages('custommetadata', 'createRecord');

export default class Create extends SfdxCommand {

    public static description = messages.getMessage('commandDescription');

    public static examples = [
    `$ sfdx custommetadata:record:create --typename MyCMT --recname MyRecord
    Created custom metadata record of the type "MyCMT" with record developer name "MyRecord", label "MyRecord", and visibility "Public".
    `,
    `$ sfdx custommetadata:record:create --typename MyCMT --recname MyRecord --label "My Record" --protected true
    Created custom metadata record of the type "MyCMT" with record developer name "MyRecord", label "MyRecord", and visibility "Protected".
    `
    ];

    protected static flagsConfig = {
      // flag with a value (-n, --name=VALUE)
      typename: flags.string({char: 't', description: messages.getMessage('typenameFlagDescription')}),
      recname: flags.string({char: 'r', description: messages.getMessage('recordNameFlagDescription')}),
      label: flags.string({char: 'l', description: messages.getMessage('labelFlagDescription')}),
      protection: flags.string({char: 'p', description: messages.getMessage('protectedFlagDescription')}),
      inputdir: flags.directory({char: 'n', description: messages.getMessage('inputDirectoryFlagDescription')}),
      outputdir: flags.directory({char: 'o', description: messages.getMessage('outputDirectoryFlagDescription')})
  };

    // public static args = [{name: 'file'}];

    protected static varargs = {
      required: false,
      validator: (name, value) => {
          // only custom fields allowed
          if (!name.endsWith('__c')) {
              const errMsg = `Invalid parameter [${name}] found`;
              const errName = 'InvalidVarargName';
              const errAction = messages.getMessage('errorInvalidCustomField');
              throw new core.SfdxError(errMsg, errName, [errAction]);
          }
      }
    };

    // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
    protected static requiresProject = true;

    public async run(): Promise<AnyJson> {
      const createUtil = new CreateUtil();
      const fileWriter = new FileWriter();
      let typename = this.flags.typename;
      const recname = this.flags.recname;
      const label = this.flags.label || this.flags.recname;
      const protection = this.flags.protection || 'false';
      const inputdir = this.flags.inputdir || 'force-app/main/default/objects';
      const outputdir = this.flags.outputdir || 'force-app/main/default/customMetadata';

      // forgive them if they passed in type__mdt, and cut off the __mdt
      if (typename.endsWith('__mdt')) {
          typename = typename.substring(0, typename.indexOf('__mdt'));
      }

      const fieldDirPath = `${fileWriter.createDir(inputdir)}${typename}__mdt/fields`;
      const fileNames = await core.fs.readdir(fieldDirPath);

      // if customMetadata folder does not exist, create it
      await core.fs.mkdirp(outputdir);

      const fileData = await this.getData(fieldDirPath, fileNames);

      await createUtil.createRecord({
        typename,
        recname,
        label,
        inputdir,
        outputdir,
        protection,
        varargs: this.varargs,
        fileData
      });

      const outputString = messages.getMessage('successResponse', [typename, recname, label, protection, outputdir]);
      this.ux.log(outputString);

      // Return an object to be displayed with --json
      return {
          typename,
          recname,
          label,
          visibility: protection
      };
    }

    private async getData(fieldDirPath, fileNames) {
      const ret = [];
      let filePath = '';
      let fileData;
      let str = '';

      for (const file of fileNames) {
        filePath = `${fieldDirPath}/${file}`;
        fileData = await core.fs.readFile(filePath);
        str = fileData.toString('utf8');

        parseString(str, (err, res) => {
          if (!err) {
            ret.push(res);
          }
        });
      }

      return ret;
    }
}
