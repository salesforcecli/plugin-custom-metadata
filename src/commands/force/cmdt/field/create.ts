import {core, flags, SfdxCommand} from '@salesforce/command';
import {AnyJson} from '@salesforce/ts-types';
import { createField } from '../../../../lib/helpers/helper';
import { createFieldXML } from '../../../../lib/templates/templates';

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

    public static args = [{name: 'file'}];

    

//     -n | --fieldname FIELDNAME
// -l | --label LABEL
// -f | fieldtype FIELDTYPE
// -p | picklistvalues PICKLISTVALUES
// -d | --deploy DEPLOY
// --json
// --loglevel LOGLEVEL

    protected static flagsConfig = {
        fieldname: flags.string({char: 'n', required:true, description: messages.getMessage('nameFlagDescription')}), 
        fieldtype: flags.string({char: 'f', required:true, description: messages.getMessage('labelFlagDescription')}),
        picklistvalues: flags.string({char: 'p', description: messages.getMessage('plurallabelFlagDescription')}),
        label: flags.string({char: 'l', description: messages.getMessage('plurallabelFlagDescription')})
    };

    // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
    protected static requiresProject = true;

    public async run(): Promise<AnyJson> {
        var testFile = { aggregatable: false,
            aiPredictionField: false,
            autoNumber: false,
            byteLength: 765,
            calculated: false,
            calculatedFormula: null,
            cascadeDelete: false,
            caseSensitive: false,
            compoundFieldName: null,
            controllerName: null,
            createable: false,
            custom: true,
            defaultValue: null,
            defaultValueFormula: null,
            defaultedOnCreate: false,
            dependentPicklist: false,
            deprecatedAndHidden: false,
            digits: 0,
            displayLocationInDecimal: false,
            encrypted: false,
            externalId: false,
            extraTypeInfo: 'plaintextarea',
            filterable: true,
            filteredLookupInfo: null,
            formulaTreatNullNumberAsZero: false,
            groupable: true,
            highScaleNumber: false,
            htmlFormatted: false,
            idLookup: false,
            inlineHelpText: null,
            label: 'Text Area',
            length: 255,
            mask: null,
            maskType: null,
            name: 'Text_Area__c',
            nameField: false,
            namePointing: false,
            nillable: true,
            permissionable: false,
            picklistValues: [],
            polymorphicForeignKey: false,
            precision: 0,
            queryByDistance: false,
            referenceTargetField: null,
            referenceTo: [],
            relationshipName: null,
            relationshipOrder: null,
            restrictedDelete: false,
            restrictedPicklist: false,
            scale: 0,
            searchPrefilterable: false,
            soapType: 'xsd:string',
            sortable: true,
            type: 'textarea',
            unique: false,
            updateable: false,
            writeRequiresMasterRead: false };

        const fieldName = this.flags.fieldname; // this should become the new file name
        const fieldLabel = this.flags.label;
        const fieldtype = this.flags.fieldtype;
        //const picklistvalues = this.flags.picklistvalues;
        const visibility = this.flags.visibility || 'Public';
        let fieldXML = createFieldXML(testFile);
        try {
          await createField(core.fs,fieldName, fieldXML);
        } catch (err) {
          this.ux.log(err);
        }
        const outputString = `Created custom metadata field called ${fieldName}.`;
        this.ux.log(outputString);
        // Return an object to be displayed with --json
        return {
            fieldName,
            fieldLabel,
            fieldtype,
            visibility
        };

    }

}
