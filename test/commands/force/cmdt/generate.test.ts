/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/* eslint-disable camelcase */

import * as fs from 'fs';
import { expect, test } from '@salesforce/command/lib/test';
import { Connection, Org } from '@salesforce/core';

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

describe('sfdx force:cmdt:generate', () => {
  test
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .stderr()
    .stub(Org.prototype, 'getConnection', function () {
      return { metadata, query };
    })
    .stub(Connection, 'create', function () {
      return { metadata, query };
    })
    .command(['force:cmdt:generate', '-n', 'MyCMDT', '-s', 'TriggerSettings__c', '-u', 'test@org.com'])
    .it('runs force:cmdt:generate -n MyCMDT -s TriggerSettings__c -u test@org.com', (ctx) => {
      const cmdtName = 'MyCMDT';
      expect(fs.existsSync(`force-app/main/default/objects/${cmdtName}__mdt`)).to.be.true;
      expect(
        fs.existsSync(`force-app/main/default/objects/${cmdtName}__mdt/fields/IsAfterDeleteDisabled__c.field-meta.xml`)
      ).to.be.true;
      expect(fs.existsSync(`force-app/main/default/customMetadata/${cmdtName}.Record1.md-meta.xml`)).to.be.true;
      expect(fs.existsSync(`force-app/main/default/customMetadata/${cmdtName}.Record2.md-meta.xml`)).to.be.true;
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
      expect(ctx.stderr).to.contain('No user found with the provided username or alias test2@org.con');
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .stderr()
    .stub(Org.prototype, 'getConnection', function () {
      return { metadata, query };
    })
    .stub(Connection, 'create', function () {
      return { metadata, query };
    })
    .command(['force:cmdt:generate', '-n', 'MyCM__DT', '-s', 'TriggerSettings__c'])
    .it('Not a valid metadata type name while running force:cmdt:generate -n MyCMDT -s TriggerSettings__c', (ctx) => {
      expect(ctx.stderr).to.contain('Not a valid custom metadata type name MyCM__DT');
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .stderr()
    .stub(Org.prototype, 'getConnection', function () {
      return { metadata, query };
    })
    .stub(Connection, 'create', function () {
      return { metadata, query };
    })
    .command(['force:cmdt:generate', '-n', 'MyCMDT__mdt', '-s', 'TriggerSettings__c'])
    .it('force:cmdt:generate -n MyCMDT -s TriggerSettings__c', (ctx) => {
      expect(ctx.stderr).to.contain('custom metadata type and records creation in completed');
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .stderr()
    .stub(Org.prototype, 'getConnection', function () {
      return { metadata, query };
    })
    .stub(Connection, 'create', function () {
      return { metadata, query };
    })
    .command(['force:cmdt:generate', '-n', 'MyCMDT__mdt', '-s', 'Trigger__Settings__c'])
    .it('Not a valid custom set while running force:cmdt:generate -n MyCMDT -s TriggerSettings__c', (ctx) => {
      expect(ctx.stderr).to.contain('Not a valid custom setting/custom object name Trigger__Settings__c');
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .stderr()
    .stub(Org.prototype, 'getConnection', function () {
      return { metadata: emptyMetadata, query };
    })
    .command(['force:cmdt:generate', '-n', 'MyCMDT', '-s', 'TriggerSettings__c'])
    .it('No sobject with name while running force:cmdt:generate -n MyCMDT -s TriggerSettings__c', (ctx) => {
      expect(ctx.stderr).to.contain('No sObject with name TriggerSettings__c found in the org.');
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .stderr()
    .stub(Org.prototype, 'getConnection', function () {
      return { metadata: hierarchyMetadata, query };
    })
    .command(['force:cmdt:generate', '-n', 'MyCMDT', '-s', 'TriggerSettings__c'])
    .it(
      'Cannot generate custom metadata for the c while running force:cmdt:generate -n MyCMDT -s TriggerSettings__c',
      (ctx) => {
        expect(ctx.stderr).to.contain(
          'Cannot generate custom metadata for the custom setting TriggerSettings__c. Check type and visibility.'
        );
      }
    );

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .stderr()
    .stub(Org.prototype, 'getConnection', function () {
      return { metadata, query: errorQuery };
    })
    .stub(Connection, 'create', function () {
      return { metadata, query: errorQuery };
    })
    .command(['force:cmdt:generate', '-n', 'MyCMDT__mdt', '-s', 'TriggerSettings__c'])
    .it('force:cmdt:generate -n MyCMDT -s TriggerSettings__c', (ctx) => {
      expect(ctx.stderr).to.contain(
        'Failed to generate custom metadata. Reason: sObjectRecords.records is not iterable.'
      );
    });
});
