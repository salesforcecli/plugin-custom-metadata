import { core, flags, SfdxCommand } from '@salesforce/command';
import { AnyJson } from '@salesforce/ts-types';
import { FileWriter } from '../../../lib/helpers/fileWriter';
import { ValidationUtil } from '../../../lib/helpers/validationUtil';
import { Templates } from '../../../lib/templates/templates';

// Initialize Messages with the current plugin directory
core.Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = core.Messages.loadMessages('custommetadata', 'createType');

export default class Create extends SfdxCommand {

    public static description = messages.getMessage('commandDescription');

    public static examples = [
        `$ sfdx force:cmdt:create --devname MyCMT
    Created custom metadata type with developer name "MyCMT", label "MyCMT", plural label "MyCMT", and visibility "Public".
    `,
        `$ sfdx force:cmdt:create --devname MyCMT --label "Custom Type" --plurallabel "Custom Types" --visibility Protected
    Created custom metadata type with developer name "MyCMT", label "Custom Type", plural label "My Custom Metadata Type", and visibility "Protected".
    `
    ];

    public static args = [{ name: 'file' }];

    protected static flagsConfig = {
        devname: flags.string({ char: 'n', required: true, description: messages.getMessage('nameFlagDescription') }),
        label: flags.string({ char: 'l', description: messages.getMessage('labelFlagDescription') }),
        plurallabel: flags.string({ char: 'p', description: messages.getMessage('plurallabelFlagDescription') }),
        visibility: flags.enum({ char: 'v', description: messages.getMessage('visibilityFlagDescription'), options: ['Protected', 'Public'] }),
        outputdir: flags.directory({ char: 'd', description: messages.getMessage('outputDirectoryFlagDescription') })
    };

    // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
    protected static requiresProject = true;

    public async run(): Promise<AnyJson> {
        const devname = this.flags.devname; // this should become the new file name
        const label = this.flags.label || this.flags.devname.replace('__mdt', ''); // If a label is not provided default using the dev name. trim __mdt out
        const pluralLabel = this.flags.plurallabel || label;
        const visibility = this.flags.visibility || 'Public';
        const dir = this.flags.outputdir || '';
        const templates = new Templates();
        const fileWriter = new FileWriter();
        let outputFilePath = '';

        try {
            const validator = new ValidationUtil();
            if (!validator.validateMetadataTypeName(devname)) {
                throw new core.SfdxError(messages.getMessage('errorNotValidAPIName', [devname]));
            }
            if (!validator.validateLessThanForty(label)) {
                throw new core.SfdxError(messages.getMessage('errorNotValidLabelName', [label]));
            }

            if (!validator.validateLessThanForty(pluralLabel)) {
                throw new core.SfdxError(messages.getMessage('errorNotValidPluralLabelName', [pluralLabel]));
            }
            
            const objectXML = templates.createObjectXML({ label, pluralLabel }, visibility);
            outputFilePath = await fileWriter.writeTypeFile(core.fs, dir, devname, objectXML);
            const outputString = messages.getMessage('successResponse', [devname, label, pluralLabel, visibility, outputFilePath]);
            this.ux.log(outputString);
        } catch (err) {
            this.ux.error(err.message);
        }

        // Return an object to be displayed with --json
        return {
            devname,
            label,
            pluralLabel,
            visibility,
            outputFilePath
        };

    }

}
