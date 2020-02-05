import { core, flags, SfdxCommand } from '@salesforce/command';
import { AnyJson } from '@salesforce/ts-types';
import { FileWriter } from '../../../../lib/helpers/fileWriter';
import { ValidationUtil } from '../../../../lib/helpers/validationUtil';
import { SaveResults } from '../../../../lib/interfaces/saveResults';
import { Templates } from '../../../../lib/templates/templates';

// Initialize Messages with the current plugin directory
core.Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = core.Messages.loadMessages('custommetadata', 'createField');

export default class Create extends SfdxCommand {

    public static description = messages.getMessage('commandDescription');

    public static examples = [
        '$ sfdx force:cmdt:field:create --fieldname MyField --fieldtype Checkbox',
        '$ sfdx force:cmdt:field:create --fieldname MyField --fieldtype Picklist --picklistvalues "A,B,C"'
    ];

    public static args = [{ name: 'file' }];

    protected static flagsConfig = {
        fieldname: flags.string({
            char: 'n',
            required: true,
            description: messages.getMessage('nameFlagDescription')
        }),
        fieldtype: flags.enum({
            char: 'f',
            required: true,
            description: messages.getMessage('fieldTypeDescription'),
            options: ['Checkbox', 'Date', 'DateTime', 'Email', 'Number', 'Percent', 'Phone', 'Picklist', 'Text', 'TextArea', 'LongTextArea', 'Url']
        }),
        picklistvalues: flags.array({
            char: 'p',
            description: messages.getMessage('picklistValuesDescription')
        }),
        decimalplaces: flags.number({
            char: 's',
            description: messages.getMessage('decimalplacesDescription')
        }),
        label: flags.string({
            char: 'l',
            description: messages.getMessage('labelFlagDescription')
        }),
        outputdir: flags.directory({
            char: 'd',
            description: messages.getMessage('outputDirectoryFlagDescription')
        })
    };

    // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
    protected static requiresProject = true;

    public async run(): Promise<AnyJson> {
        const fieldName = this.flags.fieldname; // this should become the new file name
        const label = this.flags.label || this.flags.fieldname;
        const fieldtype = this.flags.fieldtype;
        const picklistvalues = this.flags.picklistvalues || [];
        const decimalplaces = this.flags.decimalplaces || 0;
        const dir = this.flags.outputdir || '';
        let saveResults: SaveResults;

        const validator = new ValidationUtil();
        if (!validator.validateAPIName(fieldName)) {
            throw new core.SfdxError(messages.getMessage('invalidCustomFieldError', [fieldName]));
        }
        if (fieldtype === 'Picklist' && picklistvalues.length === 0) {
            throw new core.SfdxError(messages.getMessage('picklistValuesNotSuppliedError'));
        }
        if (decimalplaces < 0) {
            throw new core.SfdxError(messages.getMessage('invalidDecimalError'));
        }
        const templates = new Templates();
        const data = templates.createDefaultTypeStructure(fieldName, fieldtype, label, picklistvalues, decimalplaces);
        const fieldXML = templates.createFieldXML(data, false);
        const writer = new FileWriter();
        saveResults = await writer.writeFieldFile(core.fs, dir, fieldName, fieldXML);

        this.ux.log(messages.getMessage('targetDirectory', [saveResults.dir]));
        this.ux.log(messages.getMessage(saveResults.updated ? 'fileUpdate' : 'fileCreated', [saveResults.fileName]));

        // Return an object to be displayed with --json
        return {
            fieldName,
            label,
            fieldtype
        };

    }

}
