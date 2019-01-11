import {core, flags, SfdxCommand} from '@salesforce/command';
import * as memFs from 'mem-fs';
import * as editor from 'mem-fs-editor';
import { JsonMap } from '@salesforce/core';
import { createField } from '../../../lib/helpers/helper';


// Initialize Messages with the current plugin directory
core.Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = core.Messages.loadMessages('custommetadata', 'createField');

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
        protection: flags.string({char: 'p', description: messages.getMessage('protectedFlagDescription')}),
        sample: flags.string({ char: 'q',description: 'Sample'})
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

        
        // Return an object to be displayed with --json
        return {
            typename: typename,
            recname: recname,
            label: label,
            visibility: protection
        };

    }

}
