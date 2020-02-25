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
  public static longDescription = messages.getMessage('commandLongDescription');

  public static examples = [
    'Create a record metadata file for custom metadata type "MyCMT" with values specified for two custom fields:',
    '    $ sfdx force:cmdt:record:create --typename MyCMT__mdt --recordname MyRecord My_Custom_Field_1=Foo My_Custom_Field_2=Bar',
    'Create a protected record metadata file for custom metadata type "MyCMT" with a specific label and values specified for two custom fields:',
    '    $ sfdx force:cmdt:record:create --typename MyCMT__mdt --recordname MyRecord --label "' + messages.getMessage('labelFlagExample') + '" ' +
        '--protected true My_Custom_Field_1=Foo My_Custom_Field_2=Bar'
  ];

  protected static flagsConfig = {
    typename: flags.string({
        char: 't',
        description: messages.getMessage('typenameFlagDescription'),
        longDescription: messages.getMessage('typenameFlagLongDescription'),
        required: true
    }),
    recordname: flags.string({
        char: 'n',
        description: messages.getMessage('recordNameFlagDescription'),
        longDescription: messages.getMessage('recordNameFlagLongDescription'),
        required: true
    }),
    label: flags.string({
        char: 'l',
        description: messages.getMessage('labelFlagDescription'),
        longDescription: messages.getMessage('labelFlagLongDescription')
    }),
    protected: flags.string({
        char: 'p',
        description: messages.getMessage('protectedFlagDescription'),
        longDescription: messages.getMessage('protectedFlagLongDescription'),
        options: ['true', 'false'],
        default: 'false'
    }),
    inputdir: flags.directory({
        char: 'i',
        description: messages.getMessage('inputDirectoryFlagDescription'),
        longDescription: messages.getMessage('inputDirectoryFlagLongDescription'),
        default: 'force-app/main/default/objects'
    }),
    outputdir: flags.directory({
        char: 'd',
        description: messages.getMessage('outputDirectoryFlagDescription'),
        longDescription: messages.getMessage('outputDirectoryFlagLongDescription'),
        default: 'force-app/main/default/customMetadata'
    })
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
      const recordname = this.flags.recordname;
      const label = this.flags.label || this.flags.recordname;
      const protectedFlag = this.flags.protected || 'false';
      const inputdir = this.flags.inputdir || 'force-app/main/default/objects';
      const outputdir = this.flags.outputdir || 'force-app/main/default/customMetadata';
      const dirName = createUtil.appendDirectorySuffix(typename);
      const fieldDirPath = `${fileWriter.createDir(inputdir)}${dirName}/fields`;

      if (!validator.validateMetadataTypeName(typename)) {
        throw new core.SfdxError(messages.getMessage('notValidAPINameError', [typename]));
      }

      if (!validator.validateMetadataRecordName(recordname)) {
        throw new core.SfdxError(messages.getMessage('notAValidRecordNameError', [recordname]));
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
        recordname,
        label,
        inputdir,
        outputdir,
        protected: protectedFlag,
        varargs: this.varargs,
        fileData
      });

      this.ux.log(messages.getMessage(
        'successResponse', [typename, recordname, label, protectedFlag, outputdir]
      ));

      // Return an object to be displayed with --json
      return {
        typename,
        recordname,
        label,
        inputdir,
        outputdir,
        protectedFlag,
        varargs: this.varargs,
        fileData
      };
    } catch (err) {
      this.ux.log(err.message);
    }
  }
}
