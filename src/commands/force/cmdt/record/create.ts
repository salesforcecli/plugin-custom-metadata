import { core, flags, SfdxCommand } from '@salesforce/command';
import { AnyJson } from '@salesforce/ts-types';
import { CreateUtil } from '../../../../lib/helpers/createUtil';
import { FileWriter } from '../../../../lib/helpers/fileWriter';
import { ValidationUtil } from '../../../../lib/helpers/validationUtil';

// Initialize Messages with the current plugin directory
core.Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = core.Messages.loadMessages('custommetadata', 'createRecord');

export default class Create extends SfdxCommand {

  public static description = messages.getMessage('commandDescription');

  public static examples = [
    '$ sfdx force:cmdt:create --typename MyCMT__mdt --recname MyRecord My_Custom_Field_1=Foo My_Custom_Field_2=Bar',
    '$ sfdx force:cmdt:create --typename MyCMT__mdt --recname MyRecord --label "My Record" --protected true My_Custom_Field_1=Foo My_Custom_Field_2=Bar'
  ];

  protected static flagsConfig = {
    typename: flags.string({char: 't', description: messages.getMessage('typenameFlagDescription')}),
    recname: flags.string({char: 'r', description: messages.getMessage('recordNameFlagDescription')}),
    label: flags.string({char: 'l', description: messages.getMessage('labelFlagDescription')}),
    protection: flags.string({char: 'p', description: messages.getMessage('protectedFlagDescription')}),
    inputdir: flags.directory({char: 'n', description: messages.getMessage('inputDirectoryFlagDescription')}),
    outputdir: flags.directory({char: 'd', description: messages.getMessage('outputDirectoryFlagDescription')})
  };

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
    try {
      const validator = new ValidationUtil();
      const createUtil = new CreateUtil();
      const fileWriter = new FileWriter();
      let typename = this.flags.typename;
      const recname = this.flags.recname;
      const label = this.flags.label || this.flags.recname;
      const protection = this.flags.protection || 'false';
      const inputdir = this.flags.inputdir || 'force-app/main/default/objects';
      const outputdir = this.flags.outputdir || 'force-app/main/default/customMetadata';
      const dirName = createUtil.appendDirectorySuffix(typename);
      const fieldDirPath = `${fileWriter.createDir(inputdir)}${dirName}/fields`;

      if (!validator.validateMetadataTypeName(typename)) {
        throw new core.SfdxError(messages.getMessage('notValidAPINameError', [typename]));
      }

      if (!validator.validateMetadataRecordName(recname)) {
        throw new core.SfdxError(messages.getMessage('notAValidRecordNameError', [recname]));
      }

      if (!validator.validateLessThanForty(label)) {
        throw new core.SfdxError(messages.getMessage('notAValidLabelNameError', [label]));
      }

      const fileNames = await core.fs.readdir(fieldDirPath);

      // forgive them if they passed in type__mdt, and cut off the __mdt
      if (typename.endsWith('__mdt')) {
          typename = typename.substring(0, typename.indexOf('__mdt'));
      }

      // if customMetadata folder does not exist, create it
      await core.fs.mkdirp(outputdir);

      const fileData = await createUtil.getFileData(fieldDirPath, fileNames);

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

      this.ux.log(messages.getMessage(
        'successResponse', [typename, recname, label, protection, outputdir]
      ));

      // Return an object to be displayed with --json
      return {
        typename,
        recname,
        label,
        inputdir,
        outputdir,
        protection,
        varargs: this.varargs,
        fileData
      };
    } catch (err) {
      this.ux.log(err.message);
    }
  }
}
