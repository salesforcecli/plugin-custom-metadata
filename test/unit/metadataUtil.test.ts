import { core } from '@salesforce/command';
import { testSetup } from '@salesforce/core/lib/testSetup';
import { fromStub, stubInterface } from '@salesforce/ts-sinon';
import { deepStrictEqual } from 'assert';
import { Metadata } from 'jsforce';
import { MetadataUtil } from '../../src/lib/helpers/metadataUtil';

const $$ = testSetup();

describe('metadataUtil', () => {
    describe('describeObj', async  () => {
        it('should get object in response', async () => {
            const readResponse = { fullName: 'TriggerSettings__c',
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

            // Setup your metadata mock
            const metadata = fromStub(stubInterface<Metadata>($$.SANDBOX, {
                read: async () => (readResponse)
            }));

            // Setup your connection mock using the mock metadata
            const conn = fromStub(stubInterface<core.Connection>($$.SANDBOX, { metadata }));

            // Pass in the mock connection
            const metadataUtil = new MetadataUtil(conn);

            const objDescribe = await metadataUtil.describeObj('TriggerSettings__c');
            deepStrictEqual(objDescribe, readResponse);
        });

    });

    describe('queryRecords', async  () => {
        it('should get records in response', async () => {
            const readResponse = { fullName: 'TriggerSettings__c',
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

            const queryResponse = { totalSize: 2,
                done: true,
                records:
                    [ { IsAfterDeleteDisabled__c: true,
                        IsAfterInsertDisabled__c: true,
                        IsAfterUndeleteDisabled__c: false,
                        IsAfterUpdateDisabled__c: false,
                        IsBeforeDeleteDisabled__c: true,
                        IsBeforeInsertDisabled__c: false,
                        IsBeforeUpdateDisabled__c: true,
                        IsDisabled__c: false },
                    { IsAfterDeleteDisabled__c: true,
                        IsAfterInsertDisabled__c: true,
                        IsAfterUndeleteDisabled__c: false,
                        IsAfterUpdateDisabled__c: false,
                        IsBeforeDeleteDisabled__c: true,
                        IsBeforeInsertDisabled__c: false,
                        IsBeforeUpdateDisabled__c: true,
                        IsDisabled__c: false } ] };

            // Setup your metadata mock
            const metadata = fromStub(stubInterface<Metadata>($$.SANDBOX, {
                read: async () => (readResponse)
            }));

            // Setup your connection mock using the mock metadata
            const conn = fromStub(stubInterface<core.Connection>($$.SANDBOX, { metadata, query: async () => (queryResponse) }));

            // Pass in the mock connection
            const metadataUtil = new MetadataUtil(conn);

            const objDescribe = await metadataUtil.describeObj('TriggerSettings__c');
            const queryRes = await metadataUtil.queryRecords(objDescribe);
            deepStrictEqual(objDescribe, readResponse);
            deepStrictEqual(queryRes['totalSize'], queryResponse['totalSize']);
        });

    });

    describe('describeObjFields', async  () => {
        it('should get fields describe in response', async () => {
            const readResponse = { fullName: 'TriggerSettings__c',
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

            // Setup your metadata mock
            const metadata = fromStub(stubInterface<Metadata>($$.SANDBOX, {
                read: async () => (readResponse)
            }));

            // Setup your connection mock using the mock metadata
            const conn = fromStub(stubInterface<core.Connection>($$.SANDBOX, { metadata }));

            // Pass in the mock connection
            const metadataUtil = new MetadataUtil(conn);

            const objDescribe = await metadataUtil.describeObj('TriggerSettings__c');
            const fieldsDescribe = await metadataUtil.describeObjFields(objDescribe);
            deepStrictEqual(objDescribe, readResponse);
            deepStrictEqual(objDescribe['fields'], fieldsDescribe);
        });

    });

    describe('describeField', async  () => {
        it('should get field describe in response', async () => {
            const readResponse = { fullName: 'TriggerSettings__c',
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

            // Setup your metadata mock
            const metadata = fromStub(stubInterface<Metadata>($$.SANDBOX, {
                read: async () => (readResponse)
            }));

            // Setup your connection mock using the mock metadata
            const conn = fromStub(stubInterface<core.Connection>($$.SANDBOX, { metadata }));

            // Pass in the mock connection
            const metadataUtil = new MetadataUtil(conn);

            const objDescribe = await metadataUtil.describeObj('TriggerSettings__c');
            const fieldDescribe = await metadataUtil.describeField(objDescribe, 'IsDisabled__c');
            deepStrictEqual(fieldDescribe['fullName'], 'IsDisabled__c' );
        });

    });

    describe('validCustomSettingType', async  () => {
        it('should check the custom setting type and visibility', async () => {
            const readResponse = { fullName: 'TriggerSettings__c',
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

            // Setup your metadata mock
            const metadata = fromStub(stubInterface<Metadata>($$.SANDBOX, {
                read: async () => (readResponse)
            }));

            // Setup your connection mock using the mock metadata
            const conn = fromStub(stubInterface<core.Connection>($$.SANDBOX, { metadata }));

            // Pass in the mock connection
            const metadataUtil = new MetadataUtil(conn);

            const objDescribe = await metadataUtil.describeObj('TriggerSettings__c');
            const isvalidCustomSetting = await metadataUtil.validCustomSettingType(objDescribe);
            deepStrictEqual(isvalidCustomSetting, true);
        });

    });

});
