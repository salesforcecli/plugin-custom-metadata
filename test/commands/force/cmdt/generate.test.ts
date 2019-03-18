 import { expect, test } from '@salesforce/command/lib/test';
 import * as fs from 'fs';
 import { promisify } from 'util';
import { Org } from '@salesforce/core';
import { core } from '@salesforce/command';
// import { MetadataUtil } from '../../../../src/lib/helpers/metadataUtil';


const child_process = require('child_process');

const exec = promisify(child_process.exec);
const metadata = {
    read: function () {
        return {
            fullName: 'TriggerSettings__c',
            customSettingsType: 'List',
            description: 'Used to declaratively enable/disable custom triggers.',
            enableFeeds: 'false',
            fields:
                [{
                    fullName: 'IsAfterDeleteDisabled__c',
                    defaultValue: 'false',
                    externalId: 'false',
                    label: 'After Delete Disabled?',
                    trackTrending: 'false',
                    type: 'Checkbox'
                },
                {
                    fullName: 'IsDisabled__c',
                    defaultValue: 'false',
                    externalId: 'false',
                    inlineHelpText: 'Check this to disable the trigger',
                    label: 'Disabled?',
                    trackTrending: 'false',
                    type: 'Checkbox'
                }],
            label: 'Trigger Settings',
            visibility: 'Public'
        }
    }
    
};

const query = function(){ return  { totalSize: 2,
    done: true,
    records:
        [ { Name: 'Record1',
            IsAfterDeleteDisabled__c: true,
            IsDisabled__c: false,
            Test_Geo_location__c: {latitude: 12.34534534, longitude: 32.34534543} },
        { Name: 'Record2',
            IsAfterDeleteDisabled__c: true,
            IsDisabled__c: false,
            Test_Geo_location__c: {latitude: 10.34534534, longitude: 42.34534543} } ] }
        };


describe('sfdx force:cmdt:generate', () => {

    test
        .withOrg({ username: 'test@org.com' }, true)
        .stdout()
        .withProject()
        .stub(Org.prototype, 'getConnection',function(){ return {metadata,query}})
        .stub(core.Connection,'create',function(){ return {metadata,query}})
        .command(['force:cmdt:generate', '-n', 'MyCMDT', '-s', 'TriggerSettings__c', '-x', 'test@org.com'])
        .it('runs force:cmdt:create -n MyCMDT -s TriggerSettings__c', ctx => {
            const cmdtName = 'MyCMDT';
            expect(fs.existsSync(`force-app/main/default/objects/${cmdtName}__mdt`)).to.be.true;
            expect(fs.existsSync(`force-app/main/default/objects/${cmdtName}__mdt/fields/IsAfterDeleteDisabled__c.field-meta.xml`)).to.be.true;
            expect(fs.existsSync(`force-app/main/default/customMetadata/${cmdtName}.Record1.md-meta.xml`)).to.be.true;
            expect(fs.existsSync(`force-app/main/default/customMetadata/${cmdtName}.Record2.md-meta.xml`)).to.be.true;
            exec(`rm -rf force-app`);
        });
})
