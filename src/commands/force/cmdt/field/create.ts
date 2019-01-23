import { core, flags, SfdxCommand } from '@salesforce/command';
import { AnyJson } from '@salesforce/ts-types';
import { FileWriter } from '../../../../lib/helpers/fileWriter';
import { ValidationUtil } from '../../../../lib/helpers/validationUtil';
import { Templates } from '../../../../lib/templates/templates';

// Initialize Messages with the current plugin directory
core.Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = core.Messages.loadMessages('custommetadata', 'createType');

export default class Create extends SfdxCommand {

    public static description = messages.getMessage('commandDescription');

    public static examples = [
        `$ sfdx force:cmdt:type:create --devname MyCMT
    Created custom metadata type with developer name "MyCMT", label "MyCMT", plural label "MyCMT", and visibility "Public".
    `,
        `$ sfdx force:cmdt:type:create --devname MyCMT --label "Custom Type" --plurallabel "Custom Types" --visibility Protected
    Created custom metadata type with developer name "MyCMT", label "Custom Type", plural label "My Custom Metadata Type", and visibility "Protected".
    `
    ];

    public static args = [{ name: 'file' }];

    protected static flagsConfig = {
        fieldname: flags.string({ char: 'n', required: true, description: messages.getMessage('nameFlagDescription') }),
        fieldtype: flags.enum({
            char: 'f', required: true, description: messages.getMessage('labelFlagDescription'),
            options: ['Checkbox', 'Date', 'DateTime', 'Email', 'Number', 'Percent', 'Phone', 'Picklist', 'Text', 'TextArea', 'LongTextArea', 'Url']
        }),
        picklistvalues: flags.array({ char: 'p', description: messages.getMessage('plurallabelFlagDescription') }),
        label: flags.string({ char: 'l', description: messages.getMessage('plurallabelFlagDescription') }),
        outputdir: flags.directory({ char: 'd', description: messages.getMessage('outputDirectoryFlagDescription') })
    };

    // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
    protected static requiresProject = true;

    public async run(): Promise<AnyJson> {
        const fieldName = this.flags.fieldname; // this should become the new file name
        const label = this.flags.label || this.flags.fieldName;
        const fieldtype = this.flags.fieldtype;
        const picklistvalues = this.flags.picklistvalues || [];
        const visibility = this.flags.visibility || 'Public';
        const dir = this.flags.outputdir || '';

        try {
            const validator = new ValidationUtil();
            if (!validator.validateAPIName(fieldName)) {
                throw new Error('Not a valid field');
            }
            if (fieldtype === 'Picklist' && picklistvalues.length === 0) {
                throw new Error('Picklist values are required when type is Picklist');
            }
            const templates = new Templates();
            const data = templates.createDefaultTypeStructure(fieldName, fieldtype, label, picklistvalues);
            const fieldXML = templates.createFieldXML(data, false);
            const writer = new FileWriter();
            await writer.writeFieldFile(core.fs, dir, fieldName, fieldXML);
            const outputString = `Created custom metadata field called ${fieldName}.`;
            this.ux.log(outputString);
        } catch (err) {
            this.ux.log(err.message);
        }

        // Return an object to be displayed with --json
        return {
            fieldName,
            label,
            fieldtype,
            visibility
        };

    }

}
