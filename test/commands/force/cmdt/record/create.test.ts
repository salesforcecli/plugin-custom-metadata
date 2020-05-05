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

describe('sfdx force:cmdt:record:create error handling', () => {
  test
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .withProject()
    .command([
      'force:cmdt:create',
      '--typename', 'Bad_Dev_Name',
      '--outputdir', 'badDevNameDir'])
    .command([
      'force:cmdt:record:create',
      '-t', 'pbwbFgJM4GyDOaNZn60NjAy3Ciks791y_dKLsPmXS6',
      '-n', 'Foobar',
      '-l', 'Foobar',
      '-p', 'true',
      '-i', 'badDevNameDir',
      '-d', 'badDevNameDir/customMetadata'
    ])
    .it('runs force:cmdt:record:create and throws an error if the API name is invalid', ctx => {
      expect(ctx.stdout).to.contain("'pbwbFgJM4GyDOaNZn60NjAy3Ciks791y_dKLsPmXS6' is not a valid API name for a custom metadata type.");

      exec(`rm -rf badDevNameDir`);
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .withProject()
    .command([
      'force:cmdt:create',
      '--typename', 'Bad_Record_Name_Test',
      '--outputdir', 'recordNameErrorDir'
    ])
    .command([
      'force:cmdt:field:create',
      '--fieldname', 'Check',
      '--fieldtype', 'Checkbox',
      '--outputdir', 'recordNameErrorDir/Bad_Record_Name_Test__mdt'
    ])
    .command([
      'force:cmdt:record:create',
      '-t', 'Bad_Record_Name_Test',
      '-n', 'Bad Record Name',
      '-l', 'Foobar',
      '-p', 'true',
      '-i', 'recordNameErrorDir',
      '-d', 'recordNameErrorDir/customMetadata'
    ])
    .it('runs force:cmdt:record:create and throws an error if the record name is invalid', ctx => {
      console.log(ctx);
      expect(ctx.stdout).to.contain("Bad Record Name is not a valid record name for a custom metadata record");

      exec(`rm -rf recordNameErrorDir`);
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .withProject()
    .command([
      'force:cmdt:create',
      '--typename', 'Exceed_Char_Test',
      '--outputdir', 'exceedCharDir'
    ])
    .command([
      'force:cmdt:field:create',
      '--fieldname', 'Check',
      '--fieldtype', 'Checkbox',
      '--outputdir', 'exceedCharDir/Exceed_Char_Test__mdt'
    ])
    .command([
      'force:cmdt:record:create',
      '-t', 'Foo__mdt',
      '-n', 'Foobar',
      '-l', 'Foobarfoobarfoobarfoobarfoobarfoobarfoobarfoobarfoobar',
      '-p', 'true',
      '-i', 'exceedCharDir',
      '-d', 'exceedCharDir/customMetadata'
    ])
    .it('runs force:cmdt:record:create and throws an error if there are more than 40 characters in a label', ctx => {
      expect(ctx.stdout).to.contain('Foobarfoobarfoobarfoobarfoobarfoobarfoobarfoobarfoobar is too long to be a label name');

      exec(`rm -rf exceedCharDir`);
    });
});

describe('sfdx force:cmdt:record:create', () => {

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .withProject()
    .command(['force:cmdt:create', '--typename', 'Long_Flags_Create_Test', '--outputdir', 'createWithLongFlags'])
    .command(['force:cmdt:field:create', '--fieldname', 'Check', '--fieldtype', 'Checkbox', '--outputdir', 'createWithLongFlags/Long_Flags_Create_Test__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Date', '--fieldtype', 'Date', '--outputdir', 'createWithLongFlags/Long_Flags_Create_Test__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Date_Time', '--fieldtype', 'DateTime', '--outputdir', 'createWithLongFlags/Long_Flags_Create_Test__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Email', '--fieldtype', 'Email', '--outputdir', 'createWithLongFlags/Long_Flags_Create_Test__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Number_Int', '--fieldtype', 'Number', '--decimalplaces', '0', '--outputdir', 'createWithLongFlags/Long_Flags_Create_Test__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Number_Int_No_Flag', '--fieldtype', 'Number', '--outputdir', 'createWithLongFlags/Long_Flags_Create_Test__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Number_Double', '--fieldtype', 'Number', '--decimalplaces', '4', '--outputdir', 'createWithLongFlags/Long_Flags_Create_Test__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Percent_Int', '--fieldtype', 'Percent', '--decimalplaces', '0', '--outputdir', 'createWithLongFlags/Long_Flags_Create_Test__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Percent_Int_No_Flag', '--fieldtype', 'Percent', '--outputdir', 'createWithLongFlags/Long_Flags_Create_Test__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Percent_Double', '--fieldtype', 'Percent', '--decimalplaces', '2', '--outputdir', 'createWithLongFlags/Long_Flags_Create_Test__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Phone', '--fieldtype', 'Phone', '--outputdir', 'createWithLongFlags/Long_Flags_Create_Test__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Picklist', '--fieldtype', 'Picklist', '--picklistvalues', 'Long_Flags_Create_Test', '--outputdir', 'createWithLongFlags/Long_Flags_Create_Test__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Text', '--fieldtype', 'Text', '--outputdir', 'createWithLongFlags/Long_Flags_Create_Test__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Textarea', '--fieldtype', 'TextArea', '--outputdir', 'createWithLongFlags/Long_Flags_Create_Test__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Long_Textarea', '--fieldtype', 'LongTextArea', '--outputdir', 'createWithLongFlags/Long_Flags_Create_Test__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Url', '--fieldtype', 'Url', '--outputdir', 'createWithLongFlags/Long_Flags_Create_Test__mdt'])
    .command([
      'force:cmdt:record:create',
      '--typename', 'Long_Flags_Create_Test',
      '--recordname', 'Long_Flags_Create_Test_Record',
      '--label', 'Long Flags Create Test Record Label',
      '--protected', 'true',
      '--inputdir', 'createWithLongFlags',
      '--outputdir', 'createWithLongFlags/customMetadata'
    ])
    .it('runs force:cmdt:record:create with long flags', ctx => {
      const fieldDirPath = 'createWithLongFlags';
      const filePath = 'createWithLongFlags/customMetadata/Long_Flags_Create_Test.Long_Flags_Create_Test_Record.md-meta.xml';
      const uxMessage = 'Created custom metadata record of the type \'Long_Flags_Create_Test\' with record name \'Long_Flags_Create_Test_Record\', label \'Long Flags Create Test Record Label\', and protected \'true\' at \'createWithLongFlags/customMetadata\'';

      expect(fs.existsSync(fieldDirPath)).to.be.true;
      expect(fs.existsSync(filePath)).to.be.true;
      expect(ctx.stdout).to.contain(uxMessage);

      exec(`rm -rf ${fieldDirPath}`);
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .withProject()
    .command(['force:cmdt:create', '--typename', 'Short_Flag_Test', '--outputdir', 'shortFlagDir'])
    .command(['force:cmdt:field:create', '--fieldname', 'Check', '--fieldtype', 'Checkbox', '--outputdir', 'shortFlagDir/Short_Flag_Test__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Date', '--fieldtype', 'Date', '--outputdir', 'shortFlagDir/Short_Flag_Test__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Date_Time', '--fieldtype', 'DateTime', '--outputdir', 'shortFlagDir/Short_Flag_Test__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Email', '--fieldtype', 'Email', '--outputdir', 'shortFlagDir/Short_Flag_Test__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Number_Int', '--fieldtype', 'Number', '--decimalplaces', '0', '--outputdir', 'shortFlagDir/Short_Flag_Test__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Number_Int_No_Flag', '--fieldtype', 'Number', '--outputdir', 'shortFlagDir/Short_Flag_Test__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Number_Double', '--fieldtype', 'Number', '--decimalplaces', '4', '--outputdir', 'shortFlagDir/Short_Flag_Test__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Percent_Int', '--fieldtype', 'Percent', '--decimalplaces', '0', '--outputdir', 'shortFlagDir/Short_Flag_Test__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Percent_Int_No_Flag', '--fieldtype', 'Percent', '--outputdir', 'shortFlagDir/Short_Flag_Test__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Percent_Double', '--fieldtype', 'Percent', '--decimalplaces', '2', '--outputdir', 'shortFlagDir/Short_Flag_Test__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Phone', '--fieldtype', 'Phone', '--outputdir', 'shortFlagDir/Short_Flag_Test__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Picklist', '--fieldtype', 'Picklist', '--picklistvalues', 'Short_Flag_Test', '--outputdir', 'shortFlagDir/Short_Flag_Test__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Text', '--fieldtype', 'Text', '--outputdir', 'shortFlagDir/Short_Flag_Test__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Textarea', '--fieldtype', 'TextArea', '--outputdir', 'shortFlagDir/Short_Flag_Test__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Long_Textarea', '--fieldtype', 'LongTextArea', '--outputdir', 'shortFlagDir/Short_Flag_Test__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Url', '--fieldtype', 'Url', '--outputdir', 'shortFlagDir/Short_Flag_Test__mdt'])
    .command([
      'force:cmdt:record:create',
      '-t', 'Short_Flag_Test',
      '-n', 'Short_Flag_Test_Record',
      '-l', 'Short Flag Test Record Label',
      '-p', 'true',
      '-i', 'shortFlagDir',
      '-d', 'shortFlagDir/customMetadata'
    ])
    .it('runs force:cmdt:record:create with short flags', ctx => {
      const fieldDirPath = 'shortFlagDir';
      const filePath = 'shortFlagDir/customMetadata/Short_Flag_Test.Short_Flag_Test_Record.md-meta.xml';

      expect(fs.existsSync(fieldDirPath)).to.be.true;
      expect(fs.existsSync(filePath)).to.be.true;

      exec(`rm -rf ${fieldDirPath}`);
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .withProject()
    .command(['force:cmdt:create', '--typename', 'Suffix_Test', '--outputdir', 'suffixTestDir'])
    .command(['force:cmdt:field:create', '--fieldname', 'Check', '--fieldtype', 'Checkbox', '--outputdir', 'suffixTestDir/Suffix_Test__mdt'])
    .command([
      'force:cmdt:record:create',
      '-t', 'Suffix_Test__mdt',
      '-n', 'Suffix_Test_Record',
      '-l', 'Suffix Test Record Label',
      '-p', 'true',
      '-i', 'suffixTestDir',
      '-d', 'suffixTestDir/customMetadata'
    ])
    .it('runs force:cmdt:record:create and accepts a typename with a __mdt suffix, but removes that suffix during record creation', ctx => {
      const fieldDirPath = 'suffixTestDir';
      const filePath = 'suffixTestDir/customMetadata/Suffix_Test.Suffix_Test_Record.md-meta.xml';

      expect(fs.existsSync(fieldDirPath)).to.be.true;
      expect(fs.existsSync(filePath)).to.be.true;

      exec(`rm -rf ${fieldDirPath}`);
    });
});

describe('sfdx force:cmdt:record:create test contents of record file created', () => {
  test
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .withProject()
    .command(['force:cmdt:create', '--typename', 'Output_Test', '--outputdir', 'outputTestDir'])
    .command(['force:cmdt:field:create', '--fieldname', 'Check', '--fieldtype', 'Checkbox', '--outputdir', 'outputTestDir/Output_Test__mdt'])
    .command([
      'force:cmdt:record:create',
      '-t', 'Output_Test',
      '-n', 'Output_Test_Record',
      '-i', 'outputTestDir',
      '-d', 'outputTestDir/customMetadata'
    ])
    .it('should create records without optional flags', () => {
      const fieldDirPath = 'outputTestDir/Output_Test__mdt/fields';
      const filePath = `${fieldDirPath}/Check__c.field-meta.xml`;

      expect(fs.existsSync(fieldDirPath)).to.be.true;
      expect(fs.existsSync(`${fieldDirPath}/Check__c.field-meta.xml`)).to.be.true;

      fs.readFile(filePath, { encoding: 'utf-8' }, function (err, xml) {
        expect(xml.includes(`<fullName>Check__c</fullName>`)).to.be.true;
        expect(xml.includes(`<fieldManageability>DeveloperControlled</fieldManageability>`)).to.be.true;
        expect(xml.includes(`<label>Check</label>`)).to.be.true;
        expect(xml.includes(`<type>Checkbox</type>`)).to.be.true;
        expect(xml.includes(`<defaultValue>false</defaultValue>`)).to.be.true;
      });

      exec('rm -rf outputTestDir');
    });
});
