/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/* eslint-disable camelcase */

import * as fs from 'fs';
import * as path from 'path';
import { expect, test } from '@salesforce/command/lib/test';
import { Connection, Org, Messages } from '@salesforce/core';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-custom-metadata', 'validation');

const metadata = {
  read() {
    return {
      fullName: 'TriggerSettings__c',
      customSettingsType: 'List',
      description: 'Used to declaratively enable/disable custom triggers.',
      enableFeeds: 'false',
      fields: [
        {
          fullName: 'IsAfterDeleteDisabled__c',
          defaultValue: 'false',
          externalId: 'false',
          label: 'After Delete Disabled?',
          trackTrending: 'false',
          type: 'Checkbox',
        },
        {
          fullName: 'IsDisabled__c',
          defaultValue: 'false',
          externalId: 'false',
          inlineHelpText: 'Check this to disable the trigger',
          label: 'Disabled?',
          trackTrending: 'false',
          type: 'Checkbox',
        },
        {
          fullName: 'Test_Geo_location__c',
          displayLocationInDecimal: 'true',
          externalId: 'false',
          label: 'Test Geo location',
          required: 'false',
          scale: '10',
          trackHistory: 'false',
          trackTrending: 'false',
          type: 'Location',
        },
      ],
      label: 'Trigger Settings',
      visibility: 'Public',
    };
  },
};

const emptyMetadata = {
  read() {
    return {};
  },
};

const hierarchyMetadata = {
  read() {
    return {
      fullName: 'TriggerSettings__c',
      customSettingsType: 'Hierarchy',
      visibility: 'Public',
    };
  },
};

const query = function () {
  return {
    totalSize: 2,
    done: true,
    records: [
      {
        Name: 'Record1',
        IsAfterDeleteDisabled__c: true,
        IsDisabled__c: false,
        Test_Geo_location__c: { latitude: 12.34534534, longitude: 32.34534543 },
      },
      {
        Name: 'Record2',
        IsAfterDeleteDisabled__c: true,
        IsDisabled__c: false,
        Test_Geo_location__c: { latitude: 10.34534534, longitude: 42.34534543 },
      },
    ],
  };
};

const errorQuery = function () {
  return {
    name: 'ERROR_NAME',
    message: 'Failed due to an error.',
    stack: 'ERROR_NAME: Failed due to an error',
  };
};

const mainFolder = path.join('force-app', 'main', 'default');
const objectsFolder = path.join(mainFolder, 'objects');
const metadataFolder = path.join(mainFolder, 'customMetadata');

describe('sfdx force:cmdt:generate', () => {
  test
    // tests that mock the connection are skipped because I couldn't figure out how to get stubs to work in parking orbit.
    // Left here as 1 reference for the NUT
    // repro of the stub issue so we can fix OR document how it should be done
    .skip()
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .stderr()
    .stub(Org.prototype, 'getConnection', () => ({ metadata, query }))
    .stub(Connection, 'create', () => ({ metadata, query }))
    .command(['force:cmdt:generate', '-n', 'MyCMDT', '-s', 'TriggerSettings__c', '-u', 'test@org.com'])
    .it('runs force:cmdt:generate -n MyCMDT -s TriggerSettings__c -u test@org.com', () => {
      const cmdtName = 'MyCMDT';
      expect(fs.existsSync(path.join(objectsFolder, `${cmdtName}__mdt`))).to.be.true;
      expect(
        fs.existsSync(path.join(objectsFolder, `${cmdtName}__mdt`, 'fields', 'IsAfterDeleteDisabled__c.field-meta.xml'))
      ).to.be.true;
      expect(fs.existsSync(path.join(metadataFolder, `${cmdtName}.Record1.md-meta.xml`))).to.be.true;
      expect(fs.existsSync(path.join(metadataFolder, `${cmdtName}.Record2.md-meta.xml`))).to.be.true;
      fs.rmSync('force-app', { recursive: true });
    });

  test
    .stub(Org.prototype, 'getConnection', () => ({ metadata, query }))
    .stub(Connection, 'create', () => ({ metadata, query }))
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .stderr()
    .command(['force:cmdt:generate', '-n', 'MyCMDT', '-s', 'TriggerSettings__c', '-u', 'test2@org.con'])
    .it('No user found while running force:cmdt:generate -n MyCMDT -s TriggerSettings__c -u test@org.com', (ctx) => {
      expect(ctx.stderr).to.contain('No authorization information found for test2@org.con.');
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .stderr()
    .stub(Org.prototype, 'getConnection', () => ({ metadata, query }))
    .stub(Connection, 'create', () => ({ metadata, query }))
    .command(['force:cmdt:generate', '-n', 'MyCM__DT', '-s', 'TriggerSettings__c', '-u', 'test@org.com'])
    .it('Not a valid metadata type name while running force:cmdt:generate -n MyCM__DT -s TriggerSettings__c', (ctx) => {
      expect(ctx.stderr).to.contain(messages.getMessage('invalidCMDTApiName', ['MyCM__DT']));
    });

  test
    .skip()
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .stderr()
    .stub(Org.prototype, 'getConnection', () => ({ metadata, query }))
    .stub(Connection, 'create', () => ({ metadata, query }))
    .command(['force:cmdt:generate', '-n', 'MyCMDT__mdt', '-s', 'TriggerSettings__c', '-u', 'test@org.com'])
    .it('force:cmdt:generate -n MyCMDT -s TriggerSettings__c', (ctx) => {
      expect(ctx.stderr).to.contain('custom metadata type and records creation in completed');
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .stderr()
    .stub(Org.prototype, 'getConnection', () => ({ metadata, query }))
    .stub(Connection, 'create', () => ({ metadata, query }))
    .command(['force:cmdt:generate', '-n', 'MyCMDT__mdt', '-s', 'Trigger__Settings__c', '-u', 'test@org.com'])
    .it('Not a valid custom set while running force:cmdt:generate -n MyCMDT -s TriggerSettings__c', (ctx) => {
      expect(ctx.stderr).to.contain(messages.getMessage('sobjectnameFlagError', ['Trigger__Settings__c']));
    });

  test
    .skip()
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .stderr()
    .stub(Org.prototype, 'getConnection', () => ({ metadata: emptyMetadata, query }))
    .command(['force:cmdt:generate', '-n', 'MyCMDT', '-s', 'TriggerSettings__c', '-u', 'test@org.com'])
    .it('No sobject with name while running force:cmdt:generate -n MyCMDT -s TriggerSettings__c', (ctx) => {
      expect(ctx.stderr).to.contain('No sObject with name TriggerSettings__c found in the org.');
    });

  test
    .skip()
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .stderr()
    .stub(Org.prototype, 'getConnection', () => ({ metadata: hierarchyMetadata, query }))
    .command(['force:cmdt:generate', '-n', 'MyCMDT', '-s', 'TriggerSettings__c', '-u', 'test@org.com'])
    .it(
      'Cannot generate custom metadata for the c while running force:cmdt:generate -n MyCMDT -s TriggerSettings__c',
      (ctx) => {
        expect(ctx.stderr).to.contain(
          'Cannot generate custom metadata for the custom setting TriggerSettings__c. Check type and visibility.'
        );
      }
    );

  test
    .skip()
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .stderr()
    .stub(Org.prototype, 'getConnection', () => ({ metadata, query: errorQuery }))
    .stub(Connection, 'create', () => ({ metadata, query: errorQuery }))
    .command(['force:cmdt:generate', '-n', 'MyCMDT__mdt', '-s', 'TriggerSettings__c', '-u', 'test@org.com'])
    .it('force:cmdt:generate -n MyCMDT -s TriggerSettings__c', (ctx) => {
      expect(ctx.stderr).to.contain(
        'Failed to generate custom metadata. Reason: sObjectRecords.records is not iterable.'
      );
    });
});
