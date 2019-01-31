import { expect, test } from '@salesforce/command/lib/test';
import * as fs from 'fs';
import { fromStub, stubInterface } from '@salesforce/ts-sinon';
import { core } from '@salesforce/command';
import { promisify } from 'util';
import { testSetup } from '@salesforce/core/lib/testSetup';
import { Org } from '@salesforce/core';
import { Metadata } from 'jsforce';
// import { MetadataUtil } from '../../../../src/lib/helpers/metadataUtil';

const $$ = testSetup();
const child_process = require('child_process');

const exec = promisify(child_process.exec);
const metadata = { fullName: 'TriggerSettings__c',
customSettingsType: 'List',
description: 'Used to declaratively enable/disable custom triggers.',
enableFeeds: 'false',
fields:
    [ { fullName: 'IsAfterDeleteDisabled__c',
        defaultValue: 'false',
        externalId: 'false',
        label: 'After Delete Disabled?',
        trackTrending: 'false',
        type: 'Checkbox' },
    { fullName: 'IsDisabled__c',
        defaultValue: 'false',
        externalId: 'false',
        inlineHelpText: 'Check this to disable the trigger',
        label: 'Disabled?',
        trackTrending: 'false',
        type: 'Checkbox' },
        { fullName: 'Test_Geo_location__c',
        displayLocationInDecimal: 'true',
        externalId: 'false',
        label: 'Test Geo location',
        required: 'false',
        scale: '10',
        trackHistory: 'false',
        trackTrending: 'false',
        type: 'Location' } ],
label: 'Trigger Settings',
visibility: 'Public',
read: function(){
    return {
         fullName: 'TriggerSettings__c',
            customSettingsType: 'List',
            description: 'Used to declaratively enable/disable custom triggers.',
            enableFeeds: 'false',
            fields:
                [ { fullName: 'IsAfterDeleteDisabled__c',
                    defaultValue: 'false',
                    externalId: 'false',
                    label: 'After Delete Disabled?',
                    trackTrending: 'false',
                    type: 'Checkbox' },
                { fullName: 'IsDisabled__c',
                    defaultValue: 'false',
                    externalId: 'false',
                    inlineHelpText: 'Check this to disable the trigger',
                    label: 'Disabled?',
                    trackTrending: 'false',
                    type: 'Checkbox' } ],
            label: 'Trigger Settings',
            visibility: 'Public' }
} };

// const records = { fullName: 'TriggerSettings__c',
// customSettingsType: 'List',
// description: 'Used to declaratively enable/disable custom triggers.',
// enableFeeds: 'false',
// fields:
//     [ { fullName: 'IsAfterDeleteDisabled__c',
//         defaultValue: 'false',
//         externalId: 'false',
//         label: 'After Delete Disabled?',
//         trackTrending: 'false',
//         type: 'Checkbox' },
//     { fullName: 'IsDisabled__c',
//         defaultValue: 'false',
//         externalId: 'false',
//         inlineHelpText: 'Check this to disable the trigger',
//         label: 'Disabled?',
//         trackTrending: 'false',
//         type: 'Checkbox' } ],
// label: 'Trigger Settings',
// visibility: 'Public' };


describe('sfdx force:cmdt:generate', () => {
    
    const conn = fromStub(stubInterface<core.Connection>($$.SANDBOX, { metadata }));
    
    $$.SANDBOX.stub(Org.prototype, 'getConnection').value( function (){
        return conn;
    });

    $$.SANDBOX.stub(Metadata.prototype, 'read').value(function(){
        return {}
    });
    
    $$.SANDBOX.stub(conn.metadata, 'read').value(new Promise(function(){
        return { fullName: 'TriggerSettings__c',
        customSettingsType: 'List',
        description: 'Used to declaratively enable/disable custom triggers.',
        enableFeeds: 'false',
        fields:
            [ { fullName: 'IsAfterDeleteDisabled__c',
                defaultValue: 'false',
                externalId: 'false',
                label: 'After Delete Disabled?',
                trackTrending: 'false',
                type: 'Checkbox' },
            { fullName: 'IsDisabled__c',
                defaultValue: 'false',
                externalId: 'false',
                inlineHelpText: 'Check this to disable the trigger',
                label: 'Disabled?',
                trackTrending: 'false',
                type: 'Checkbox' } ],
        label: 'Trigger Settings',
        visibility: 'Public' };
    }));

    $$.SANDBOX.stub(core.AuthInfo, 'create').value(function(){
        return { getConnectionOptions: function(){
            return {};
        }};
    })

    test
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .withProject()
    .command(['force:cmdt:generate', '-n', 'MyCMDT', '-s', 'TriggerSettings__c', '-x', 'test@org.com'])
    .it('runs force:cmdt:create -n MyCMDT -s TriggerSettings__c', ctx => {
      const cmdtName = 'MyCMDT';
      expect(fs.existsSync(`sample/${cmdtName}__mdt`)).to.be.true;
      expect(fs.existsSync(`sample/${cmdtName}__mdt/${cmdtName}__mdt.object-meta.xml`)).to.be.true;
      fs.readFile(`sample/${cmdtName}__mdt/${cmdtName}__mdt.object-meta.xml`, { encoding: 'utf-8' }, function (err, xml) {
        expect(xml.includes(`<label>MyCMDT</label>`)).to.be.true;
        expect(xml.includes(`<pluralLabel>MyCMDT</pluralLabel>`)).to.be.true;
        expect(xml.includes(`<visibility>Public</visibility>`)).to.be.true;
      });
      exec(`rm -rf sample`);
    })
})
