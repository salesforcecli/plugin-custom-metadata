import { core, flags, SfdxCommand } from '@salesforce/command';
import { AnyJson } from '@salesforce/ts-types';
import * as csv from 'csvtojson';
import { CreateUtil } from '../../../../lib/helpers/createUtil';
import { FileWriter } from '../../../../lib/helpers/fileWriter';
import { CreateConfig } from '../../../../lib/interfaces/createConfig';

// const csv = require('csvtojson');

core.Messages.importMessagesDirectory(__dirname);

const messages = core.Messages.loadMessages('custommetadata', 'insertRecord');

export default class Insert extends SfdxCommand {
  public static description = messages.getMessage('commandDescription');

  public static examples = [
    '$ sfdx force:cmdt:record:insert -f path/to/my.csv -t My_CMDT_Name',
    '$ sfdx force:cmdt:record:insert -f path/to/my.csv -t My_CMDT_Name -n path/to/my/cmdtDirectory'
  ];

  protected static flagsConfig = {
    filepath: flags.string({ char: 'f', description: messages.getMessage('filepathFlagDescription'), required: true }),
    typename: flags.string({ char: 't', description: messages.getMessage('typenameFlagDescription'), required: true }),
    inputdir: flags.directory({ char: 'n', description: messages.getMessage('inputDirectoryFlagDescription') }),
    outputdir: flags.directory({char: 'd', description: messages.getMessage('outputDirectoryFlagDescription')})
  };

  protected static requiresProject = true;

  public async run(): Promise<AnyJson> {
    try {
      const createUtil = new CreateUtil();
      const fileWriter = new FileWriter();
      const filepath = this.flags.filepath;
      let typename = this.flags.typename;
      const inputdir = this.flags.inputdir || 'force-app/main/default/objects';
      const outputdir = this.flags.outputdir || 'force-app/main/default/customMetadata';
      const dirName = createUtil.appendDirectorySuffix(typename);
      const fieldDirPath = `${fileWriter.createDir(inputdir)}${dirName}/fields`;
      const fileNames = await core.fs.readdir(fieldDirPath);

      // forgive them if they passed in type__mdt, and cut off the __mdt
      if (typename.endsWith('__mdt')) {
          typename = typename.substring(0, typename.indexOf('__mdt'));
      }

      // if customMetadata folder does not exist, create it
      await core.fs.mkdirp(outputdir);

      const fileData = await createUtil.getFileData(fieldDirPath, fileNames);
      const csvDataAry = await csv().fromFile(filepath);

      let recordConfig: CreateConfig;
      const ret = [];

      // find the cmdt in the inputdir.
      // loop through files and create records that match fields
      for (const record of csvDataAry) {
        const recname: string = record.Label.replace(' ', '_');
        const varargs: object = {};

        // create varargs
        for (const file of fileData) {
          const fullName: string = file.CustomField.fullName[0];

          if (record.hasOwnProperty(fullName)) {
            varargs[fullName] = record[fullName];
          }
        }

        recordConfig = {
          typename,
          recname,
          label: record.Label,
          inputdir,
          outputdir,
          protection: false,
          varargs,
          fileData
        };

        ret.push(recordConfig);

        await createUtil.createRecord(recordConfig);
      }

      this.ux.log(messages.getMessage(
        'successResponse', [filepath, outputdir]
      ));

      return ret;
    } catch (err) {
      console.error(err);
    }
  }
}
