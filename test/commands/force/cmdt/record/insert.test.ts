/*
 * Copyright (c) 2018-2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect, test } from '@salesforce/command/lib/test';
import * as fs from 'fs';
import { promisify } from 'util';

const child_process = require('child_process');
const exec = promisify(child_process.exec);


describe('sfdx force:cmdt:record:insert', async () => {
  const fileDir = 'csv-upload';
  if (!fs.existsSync(fileDir)) {
  fs.mkdirSync(fileDir);
  }
  await fs.writeFile('csv-upload/countries.csv','Name,CountryCode__c,CountryName__c\nAustralia,AU,Australia\n',null,function(){});

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .withProject()

    .command(['force:cmdt:create', '--typename', 'Snapple', '--outputdir', 'csv-upload'])
    .command(['force:cmdt:field:create', '--fieldname', 'CountryCode', '--fieldtype', 'Text','--outputdir', 'csv-upload/Snapple__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'CountryName', '--fieldtype', 'Text','--outputdir', 'csv-upload/Snapple__mdt'])
    .command([
      'force:cmdt:record:insert',
      '--filepath', 'csv-upload/countries.csv',
      '--typename', 'Snapple__mdt',
      '--inputdir','csv-upload',
      '--outputdir','csv-upload/metadata'
    ])
    .it('runs force:cmdt:record:insert', ctx => {
      const fieldDirPath = 'csv-upload/metadata';
      const filePath = 'csv-upload/metadata/Snapple.Australia.md-meta.xml';
      const uxMessage = 'Created custom metadata type records from \'csv-upload/countries.csv\' at \'csv-upload/metadata\'.\n';

      expect(fs.existsSync(fieldDirPath)).to.be.true;
      expect(fs.existsSync(filePath)).to.be.true;
      expect(ctx.stdout).to.contain(uxMessage);


      exec(`rm -rf ${fileDir}`);
    });


  const secondTest = 'badCSV';
  if (!fs.existsSync(secondTest)) {
  fs.mkdirSync(secondTest);
  }
  await fs.writeFile('badCSV/countries.csv','Label,CountryCode__c,CountryName__c\nAustralia,AU,Australia\n',null,function(){});

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stderr()
    .withProject()

    .command(['force:cmdt:create', '--typename', 'Snapple', '--outputdir', 'badCSV'])
    .command(['force:cmdt:field:create', '--fieldname', 'CountryCode', '--fieldtype', 'Text','--outputdir', 'badCSV/Snapple__mdt'])
    .command([
      'force:cmdt:record:insert',
      '--filepath', 'badCSV/countries.csv',
      '--typename', 'Snapple__mdt',
      '--inputdir','badCSV',
      '--outputdir','badCSV/metadata',
      '--namecolumn','Label'
    ])
    .it('fails force:cmdt:record:insert', ctx => {
      const uxMessage = 'The column CountryName__c is not found on the custom metadata type Snapple';

      expect(ctx.stderr).to.contain(uxMessage);


      exec(`rm -rf ${secondTest}`);
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stderr()
    .withProject()

    .command([
      'force:cmdt:record:insert',
      '--filepath', 'csv-upload/countries.csv',
      '--typename', 'Snape__mdt',
      '--inputdir','csv-upload',
      '--outputdir','csv-upload/metadata'
    ])
    .it('fails force:cmdt:record:insert', ctx => {
      const uxMessage = 'no such file or directory, scandir \'csv-upload/Snape__mdt/fields\'';

      expect(ctx.stderr).to.contain(uxMessage);

      exec(`rm -rf ${secondTest}`);
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stderr()
    .withProject()

    .command([
      'force:cmdt:record:insert',
      '--filepath', 'badCSV/badcountries.csv',
      '--typename', 'Snapple__mdt',
      '--inputdir','badCSV',
      '--outputdir','badCSV/metadata',
      '--namecolumn','Label'
    ])
    .it('fails force:cmdt:record:insert', ctx => {
      const uxMessage = 'no such file or directory, scandir \'badCSV/Snapple__mdt/fields\'';

      expect(ctx.stderr).to.contain(uxMessage);

      exec(`rm -rf ${secondTest}`);
    });
});
