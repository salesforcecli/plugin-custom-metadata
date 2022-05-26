/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as fs from 'fs';
import * as path from 'path';
import { expect, test } from '@salesforce/command/lib/test';

describe('sfdx force:cmdt:record:insert', () => {
  describe('good csv', () => {
    const fileDir = 'csv-upload';
    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir);
    }
    fs.writeFileSync(
      path.join('csv-upload', 'countries.csv'),
      'Name,CountryCode__c,CountryName__c\nAustralia,AU,Australia\n'
    );

    test
      .withOrg({ username: 'test@org.com' }, true)
      .finally(() => {
        fs.rmSync(fileDir, { recursive: true });
      })
      .stdout()
      .stderr()
      .command(['force:cmdt:create', '--typename', 'Snapple', '--outputdir', 'csv-upload'])
      .command([
        'force:cmdt:field:create',
        '--fieldname',
        'CountryCode',
        '--fieldtype',
        'Text',
        '--outputdir',
        path.join('csv-upload', 'Snapple__mdt'),
      ])
      .command([
        'force:cmdt:field:create',
        '--fieldname',
        'CountryName',
        '--fieldtype',
        'Text',
        '--outputdir',
        path.join('csv-upload', 'Snapple__mdt'),
      ])
      .command([
        'force:cmdt:record:insert',
        '--filepath',
        path.join('csv-upload', 'countries.csv'),
        '--typename',
        'Snapple__mdt',
        '--inputdir',
        'csv-upload',
        '--outputdir',
        path.join('csv-upload', 'metadata'),
      ])
      .it('runs force:cmdt:record:insert', (ctx) => {
        const fieldDirPath = path.join('csv-upload', 'metadata');

        const filePath = path.join('csv-upload', 'metadata', 'Snapple.Australia.md-meta.xml');
        const uxMessage =
          "Created custom metadata type records from 'csv-upload/countries.csv' at 'csv-upload/metadata'.\n";
        expect(fs.existsSync(fieldDirPath)).to.be.true;
        expect(fs.existsSync(filePath)).to.be.true;
        expect(ctx.stdout).to.contain(uxMessage);
      });
  });

  describe('bad csv', () => {
    const secondTest = 'badCSV';
    beforeEach(() => {
      if (!fs.existsSync(secondTest)) {
        fs.mkdirSync(secondTest);
      }
      fs.writeFileSync(
        path.join('badCSV', 'countries.csv'),
        'Label,CountryCode__c,CountryName__c\nAustralia,AU,Australia\n'
      );
    });
    afterEach(() => {
      fs.rmSync(secondTest, { recursive: true });
    });

    test
      .withOrg({ username: 'test@org.com' }, true)
      .stdout()
      .stderr()
      .command([
        'force:cmdt:record:insert',
        '--filepath',
        path.join('badCSV', 'countries.csv'),
        '--typename',
        'Snapple__mdt',
        '--inputdir',
        'badCSV',
        '--outputdir',
        path.join('badCSV', 'metadata'),
        '--namecolumn',
        'Label',
      ])
      .it('fails force:cmdt:record:insert', (ctx) => {
        expect(
          /.*?no such file or directory, scandir.*?badCSV.*?Snapple__mdt.*?fields.*/g.test(ctx.stderr)
        ).to.be.equal(true);
      });

    test
      .withOrg({ username: 'test@org.com' }, true)
      .stdout()
      .stderr()
      .command(['force:cmdt:create', '--typename', 'Snapple', '--outputdir', 'badCSV'])
      .command([
        'force:cmdt:field:create',
        '--fieldname',
        'CountryCode',
        '--fieldtype',
        'Text',
        '--outputdir',
        'badCSV/Snapple__mdt',
      ])
      .command([
        'force:cmdt:record:insert',
        '--filepath',
        path.join('badCSV', 'countries.csv'),
        '--typename',
        'Snapple__mdt',
        '--inputdir',
        'badCSV',
        '--outputdir',
        path.join('badCSV', 'metadata'),
        '--namecolumn',
        'Label',
      ])
      .it('fails force:cmdt:record:insert', (ctx) => {
        const uxMessage = 'The column CountryName__c is not found on the custom metadata type Snapple';
        expect(ctx.stderr).to.contain(uxMessage);
      });

    test
      .withOrg({ username: 'test@org.com' }, true)
      .stdout()
      .stderr()
      .command([
        'force:cmdt:record:insert',
        '--filepath',
        path.join('csv-upload', 'countries.csv'),
        '--typename',
        'Snape__mdt',
        '--inputdir',
        'csv-upload',
        '--outputdir',
        path.join('csv-upload', 'metadata'),
      ])
      .it('fails force:cmdt:record:insert', (ctx) => {
        expect(
          /.*?no such file or directory, scandir.*?csv-upload.*?Snape__mdt.*?fields.*/g.test(ctx.stderr)
        ).to.be.equal(true);
      });
  });
});
