import { core, flags, SfdxCommand } from '@salesforce/command';
import { AnyJson } from '@salesforce/ts-types';
import { FileWriter } from '../../../lib/helpers/fileWriter';
import { ValidationUtil } from '../../../lib/helpers/validationUtil';
import { SaveResults } from '../../../lib/interfaces/saveResults';
import { Templates } from '../../../lib/templates/templates';

// Initialize Messages with the current plugin directory
core.Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = core.Messages.loadMessages('custommetadata', 'createType');

export default class Create extends SfdxCommand {

    public static description = messages.getMessage('commandDescription');

    public static examples = [
        ' $ sfdx force:cmdt:create --typename MyCustomType',
        ' $ sfdx force:cmdt:create --typename MyCustomType --label "Custom Type" --plurallabel "Custom Types" --visibility Public'
    ];

    public static args = [{ name: 'file' }];

    protected static flagsConfig = {
        typename: flags.string({ char: 'n', required: true, description: messages.getMessage('nameFlagDescription') }),
        label: flags.string({ char: 'l', description: messages.getMessage('labelFlagDescription') }),
        plurallabel: flags.string({ char: 'p', description: messages.getMessage('plurallabelFlagDescription') }),
        visibility: flags.enum({ char: 'v', description: messages.getMessage('visibilityFlagDescription'), options: ['Protected', 'Public'] }),
        outputdir: flags.directory({ char: 'd', description: messages.getMessage('outputDirectoryFlagDescription') })
    };

    // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
    protected static requiresProject = true;

    public async run(): Promise<AnyJson> {
        const typename = this.flags.typename; // this should become the new file name
        const label = this.flags.label || this.flags.typename.replace('__mdt', ''); // If a label is not provided default using the dev name. trim __mdt out
        const pluralLabel = this.flags.plurallabel || label;
        const visibility = this.flags.visibility || 'Public';
        const dir = this.flags.outputdir || '';
        const templates = new Templates();
        const fileWriter = new FileWriter();
        let saveResults: SaveResults;

        const validator = new ValidationUtil();
        if (!validator.validateMetadataTypeName(typename)) {
            throw new core.SfdxError(messages.getMessage('errorNotValidAPIName', [typename]));
        }
        if (!validator.validateLessThanForty(label)) {
            throw new core.SfdxError(messages.getMessage('errorNotValidLabelName', [label]));
        }

        if (!validator.validateLessThanForty(pluralLabel)) {
            throw new core.SfdxError(messages.getMessage('errorNotValidPluralLabelName', [pluralLabel]));
        }

        const objectXML = templates.createObjectXML({ label, pluralLabel }, visibility);
        saveResults = await fileWriter.writeTypeFile(core.fs, dir, typename, objectXML);

        this.ux.log(messages.getMessage('targetDirectory', [saveResults.dir]));
        this.ux.log(messages.getMessage(saveResults.updated ? 'fileUpdate' : 'fileCreated', [saveResults.fileName]));

        return {
            typename,
            label,
            pluralLabel,
            visibility
        };

    }

}
