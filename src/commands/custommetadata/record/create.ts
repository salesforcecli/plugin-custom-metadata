import {core, flags, SfdxCommand} from '@salesforce/command';
import * as memFs from 'mem-fs';
import * as editor from 'mem-fs-editor';
import { JsonMap } from '@salesforce/core';


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
    `,
    ];

    //public static args = [{name: 'file'}];

    protected static flagsConfig = {
        // flag with a value (-n, --name=VALUE)
        typename: flags.string({char: 't', description: messages.getMessage('typenameFlagDescription')}),
        recname: flags.string({char: 'd', description: messages.getMessage('recordNameFlagDescription')}),
        label: flags.string({char: 'l', description: messages.getMessage('labelFlagDescription')}),
        protection: flags.string({char: 'p', description: messages.getMessage('protectedFlagDescription')})
    };

    static varargs = {
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
    }
    
    // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
    protected static requiresProject = true;

    public async run(): Promise<core.AnyJson> {
        let typename = this.flags.typename;
        const recname = this.flags.recname;
        const label = this.flags.label || this.flags.recname; 
        const protection = this.flags.protection || 'false';

        //forgive them if they passed in type__mdt, and cut off the __mdt
        if (typename.endsWith('__mdt')) {
            typename = typename.substring(0, typename.indexOf('__mdt'));
        }

        let newRecordContent = 
`<?xml version="1.0" encoding="UTF-8"?>
<CustomMetadata xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
    <label>${label}</label>
    <protected>${protection}</protected>
`;
        
        if (Object.keys(this.varargs).length > 0) {
            newRecordContent += Create.buildCustomFieldXml(this.varargs);
        }
        //TODO values
        // <values>
        //     <field>MyCustomField__c</field>
        //     <value xsi:type="xsd:string">A value in a custom field</value>
        // </values>

        newRecordContent += 
`</CustomMetadata>
`;

        var store = memFs.create();
        var fs = editor.create(store);

        const outputFilePath = `force-app/main/default/customMetadata/${typename}.${recname}.md-meta.xml`;

        fs.write(outputFilePath, newRecordContent);
        fs.commit(() => {}); //pass in an empty callback or else it freaks out

        let outputString = `Created custom metadata record of the type "${typename}" with record developer name "${recname}", label "${label}", and protected "${protection}".`;
        this.ux.log(outputString);

        // Return an object to be displayed with --json
        return {
        typename: typename,
        recname: recname,
        label: label,
        visibility: protection
        };

    }

    static buildCustomFieldXml(map: Object) {
        let ret = '';
        for (var key in map) {
        ret += 
`<values>
    <field>${key}</field>
    <value xsi:type="xsd:string">${map[key]}</value>
</values>
`;
        }
        return ret;
    }

}
