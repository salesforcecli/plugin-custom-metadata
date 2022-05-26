/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as fs from 'fs';
import * as path from 'path';
import { expect, test } from '@salesforce/command/lib/test';
import { Messages } from '@salesforce/core';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-custom-metadata', 'validation');
const commandMessages = Messages.loadMessages('@salesforce/plugin-custom-metadata', 'createRecord');

describe('sfdx force:cmdt:record:create error handling', () => {
  test
    .withOrg({ username: 'test@org.com' }, true)
    .finally(() => fs.rmSync('badDevNameDir', { recursive: true, force: true }))
    .stdout()
    .stderr()
    // .withProject() this is broken with recent versions of @salesforce/command. Ok to comment out since it's already stubbed.
    .command(['force:cmdt:create', '--typename', 'Bad_Dev_Name', '--outputdir', 'badDevNameDir'])
    .command([
      'force:cmdt:record:create',
      '-t',
      'pbwbFgJM4GyDOaNZn60NjAy3Ciks791y_dKLsPmXS6',
      '-n',
      'Foobar',
      '-l',
      'Foobar',
      '-p',
      'true',
      '-i',
      'badDevNameDir',
      '-d',
      path.join('badDevNameDir', 'customMetadata'),
    ])
    .it('runs force:cmdt:record:create and throws an error if the API name is invalid', (ctx) => {
      expect(ctx.stderr).to.contain(
        messages.getMessage('invalidCMDTApiName', ['pbwbFgJM4GyDOaNZn60NjAy3Ciks791y_dKLsPmXS6'])
      );
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .finally(() => fs.rmSync('recordNameErrorDir', { recursive: true, force: true }))
    .stdout()
    .stderr()
    .command(['force:cmdt:create', '--typename', 'Bad_Record_Name_Test', '--outputdir', 'recordNameErrorDir'])
    .command([
      'force:cmdt:field:create',
      '--fieldname',
      'Check',
      '--fieldtype',
      'Checkbox',
      '--outputdir',
      path.join('recordNameErrorDir', 'Bad_Record_Name_Test__mdt'),
    ])
    .command([
      'force:cmdt:record:create',
      '-t',
      'Bad_Record_Name_Test',
      '-n',
      'Bad Record Name',
      '-l',
      'Foobar',
      '-p',
      'true',
      '-i',
      'recordNameErrorDir',
      '-d',
      path.join('recordNameErrorDir', 'customMetadata'),
    ])
    .it('runs force:cmdt:record:create and throws an error if the record name is invalid', (ctx) => {
      expect(ctx.stderr).to.contain(messages.getMessage('notAValidRecordNameError', ['Bad Record Name']));
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .finally(() => fs.rmSync('exceedCharDir', { recursive: true, force: true }))
    .stderr()
    .command(['force:cmdt:create', '--typename', 'Exceed_Char_Test', '--outputdir', 'exceedCharDir'])
    .command([
      'force:cmdt:field:create',
      '--fieldname',
      'Check',
      '--fieldtype',
      'Checkbox',
      '--outputdir',
      path.join('exceedCharDir', 'Exceed_Char_Test__mdt'),
    ])
    .command([
      'force:cmdt:record:create',
      '-t',
      'Foo__mdt',
      '-n',
      'Foobar',
      '-l',
      'Foobarfoobarfoobarfoobarfoobarfoobarfoobarfoobarfoobar',
      '-p',
      'true',
      '-i',
      'exceedCharDir',
      '-d',
      path.join('exceedCharDir', 'customMetadata'),
    ])
    .it('runs force:cmdt:record:create and throws an error if there are more than 40 characters in a label', (ctx) => {
      expect(ctx.stderr).to.contain(
        commandMessages.getMessage('notAValidLabelNameError', [
          'Foobarfoobarfoobarfoobarfoobarfoobarfoobarfoobarfoobar',
        ])
      );
    });
});

describe('sfdx force:cmdt:record:create', () => {
  test
    .finally(() => fs.rmSync('createWithLongFlags', { recursive: true, force: true }))
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .command(['force:cmdt:create', '--typename', 'Long_Flags_Create_Test', '--outputdir', 'createWithLongFlags'])
    .command([
      'force:cmdt:field:create',
      '--fieldname',
      'Check',
      '--fieldtype',
      'Checkbox',
      '--outputdir',
      path.join('createWithLongFlags', 'Long_Flags_Create_Test__mdt'),
    ])
    .command([
      'force:cmdt:field:create',
      '--fieldname',
      'Date',
      '--fieldtype',
      'Date',
      '--outputdir',
      path.join('createWithLongFlags', 'Long_Flags_Create_Test__mdt'),
    ])
    .command([
      'force:cmdt:field:create',
      '--fieldname',
      'Date_Time',
      '--fieldtype',
      'DateTime',
      '--outputdir',
      path.join('createWithLongFlags', 'Long_Flags_Create_Test__mdt'),
    ])
    .command([
      'force:cmdt:field:create',
      '--fieldname',
      'Email',
      '--fieldtype',
      'Email',
      '--outputdir',
      path.join('createWithLongFlags', 'Long_Flags_Create_Test__mdt'),
    ])
    .command([
      'force:cmdt:field:create',
      '--fieldname',
      'Number_Int',
      '--fieldtype',
      'Number',
      '--decimalplaces',
      '0',
      '--outputdir',
      path.join('createWithLongFlags', 'Long_Flags_Create_Test__mdt'),
    ])
    .command([
      'force:cmdt:field:create',
      '--fieldname',
      'Number_Int_No_Flag',
      '--fieldtype',
      'Number',
      '--outputdir',
      path.join('createWithLongFlags', 'Long_Flags_Create_Test__mdt'),
    ])
    .command([
      'force:cmdt:field:create',
      '--fieldname',
      'Number_Double',
      '--fieldtype',
      'Number',
      '--decimalplaces',
      '4',
      '--outputdir',
      path.join('createWithLongFlags', 'Long_Flags_Create_Test__mdt'),
    ])
    .command([
      'force:cmdt:field:create',
      '--fieldname',
      'Percent_Int',
      '--fieldtype',
      'Percent',
      '--decimalplaces',
      '0',
      '--outputdir',
      path.join('createWithLongFlags', 'Long_Flags_Create_Test__mdt'),
    ])
    .command([
      'force:cmdt:field:create',
      '--fieldname',
      'Percent_Int_No_Flag',
      '--fieldtype',
      'Percent',
      '--outputdir',
      path.join('createWithLongFlags', 'Long_Flags_Create_Test__mdt'),
    ])
    .command([
      'force:cmdt:field:create',
      '--fieldname',
      'Percent_Double',
      '--fieldtype',
      'Percent',
      '--decimalplaces',
      '2',
      '--outputdir',
      path.join('createWithLongFlags', 'Long_Flags_Create_Test__mdt'),
    ])
    .command([
      'force:cmdt:field:create',
      '--fieldname',
      'Phone',
      '--fieldtype',
      'Phone',
      '--outputdir',
      path.join('createWithLongFlags', 'Long_Flags_Create_Test__mdt'),
    ])
    .command([
      'force:cmdt:field:create',
      '--fieldname',
      'Picklist',
      '--fieldtype',
      'Picklist',
      '--picklistvalues',
      'Long_Flags_Create_Test',
      '--outputdir',
      path.join('createWithLongFlags', 'Long_Flags_Create_Test__mdt'),
    ])
    .command([
      'force:cmdt:field:create',
      '--fieldname',
      'Text',
      '--fieldtype',
      'Text',
      '--outputdir',
      path.join('createWithLongFlags', 'Long_Flags_Create_Test__mdt'),
    ])
    .command([
      'force:cmdt:field:create',
      '--fieldname',
      'Textarea',
      '--fieldtype',
      'TextArea',
      '--outputdir',
      path.join('createWithLongFlags', 'Long_Flags_Create_Test__mdt'),
    ])
    .command([
      'force:cmdt:field:create',
      '--fieldname',
      'Long_Textarea',
      '--fieldtype',
      'LongTextArea',
      '--outputdir',
      path.join('createWithLongFlags', 'Long_Flags_Create_Test__mdt'),
    ])
    .command([
      'force:cmdt:field:create',
      '--fieldname',
      'Url',
      '--fieldtype',
      'Url',
      '--outputdir',
      path.join('createWithLongFlags', 'Long_Flags_Create_Test__mdt'),
    ])
    .command([
      'force:cmdt:record:create',
      '--typename',
      'Long_Flags_Create_Test',
      '--recordname',
      'Long_Flags_Create_Test_Record',
      '--label',
      'Long Flags Create Test Record Label',
      '--protected',
      'true',
      '--inputdir',
      'createWithLongFlags',
      '--outputdir',
      path.join('createWithLongFlags', 'customMetadata'),
    ])
    .it('runs force:cmdt:record:create with long flags', (ctx) => {
      const fieldDirPath = 'createWithLongFlags';
      const filePath = path.join(
        fieldDirPath,
        'customMetadata',
        'Long_Flags_Create_Test.Long_Flags_Create_Test_Record.md-meta.xml'
      );
      const uxMessage = messages.getMessage('successResponse', [
        'Long_Flags_Create_Test',
        'Long_Flags_Create_Test_Record',
        'Long Flags Create Test Record Label',
        'true',
        path.join('createWithLongFlags', 'customMetadata'),
      ]);

      expect(fs.existsSync(fieldDirPath)).to.be.true;
      expect(fs.existsSync(filePath)).to.be.true;
      expect(ctx.stdout).to.contain(uxMessage);
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .finally(() => fs.rmSync('shortFlagDir', { recursive: true, force: true }))
    .stdout()
    .command(['force:cmdt:create', '--typename', 'Short_Flag_Test', '--outputdir', 'shortFlagDir'])
    .command([
      'force:cmdt:field:create',
      '--fieldname',
      'Check',
      '--fieldtype',
      'Checkbox',
      '--outputdir',
      path.join('shortFlagDir', 'Short_Flag_Test__mdt'),
    ])
    .command([
      'force:cmdt:field:create',
      '--fieldname',
      'Date',
      '--fieldtype',
      'Date',
      '--outputdir',
      path.join('shortFlagDir', 'Short_Flag_Test__mdt'),
    ])
    .command([
      'force:cmdt:field:create',
      '--fieldname',
      'Date_Time',
      '--fieldtype',
      'DateTime',
      '--outputdir',
      path.join('shortFlagDir', 'Short_Flag_Test__mdt'),
    ])
    .command([
      'force:cmdt:field:create',
      '--fieldname',
      'Email',
      '--fieldtype',
      'Email',
      '--outputdir',
      path.join('shortFlagDir', 'Short_Flag_Test__mdt'),
    ])
    .command([
      'force:cmdt:field:create',
      '--fieldname',
      'Number_Int',
      '--fieldtype',
      'Number',
      '--decimalplaces',
      '0',
      '--outputdir',
      path.join('shortFlagDir', 'Short_Flag_Test__mdt'),
    ])
    .command([
      'force:cmdt:field:create',
      '--fieldname',
      'Number_Int_No_Flag',
      '--fieldtype',
      'Number',
      '--outputdir',
      path.join('shortFlagDir', 'Short_Flag_Test__mdt'),
    ])
    .command([
      'force:cmdt:field:create',
      '--fieldname',
      'Number_Double',
      '--fieldtype',
      'Number',
      '--decimalplaces',
      '4',
      '--outputdir',
      path.join('shortFlagDir', 'Short_Flag_Test__mdt'),
    ])
    .command([
      'force:cmdt:field:create',
      '--fieldname',
      'Percent_Int',
      '--fieldtype',
      'Percent',
      '--decimalplaces',
      '0',
      '--outputdir',
      path.join('shortFlagDir', 'Short_Flag_Test__mdt'),
    ])
    .command([
      'force:cmdt:field:create',
      '--fieldname',
      'Percent_Int_No_Flag',
      '--fieldtype',
      'Percent',
      '--outputdir',
      path.join('shortFlagDir', 'Short_Flag_Test__mdt'),
    ])
    .command([
      'force:cmdt:field:create',
      '--fieldname',
      'Percent_Double',
      '--fieldtype',
      'Percent',
      '--decimalplaces',
      '2',
      '--outputdir',
      path.join('shortFlagDir', 'Short_Flag_Test__mdt'),
    ])
    .command([
      'force:cmdt:field:create',
      '--fieldname',
      'Phone',
      '--fieldtype',
      'Phone',
      '--outputdir',
      path.join('shortFlagDir', 'Short_Flag_Test__mdt'),
    ])
    .command([
      'force:cmdt:field:create',
      '--fieldname',
      'Picklist',
      '--fieldtype',
      'Picklist',
      '--picklistvalues',
      'Short_Flag_Test',
      '--outputdir',
      path.join('shortFlagDir', 'Short_Flag_Test__mdt'),
    ])
    .command([
      'force:cmdt:field:create',
      '--fieldname',
      'Text',
      '--fieldtype',
      'Text',
      '--outputdir',
      path.join('shortFlagDir', 'Short_Flag_Test__mdt'),
    ])
    .command([
      'force:cmdt:field:create',
      '--fieldname',
      'Textarea',
      '--fieldtype',
      'TextArea',
      '--outputdir',
      path.join('shortFlagDir', 'Short_Flag_Test__mdt'),
    ])
    .command([
      'force:cmdt:field:create',
      '--fieldname',
      'Long_Textarea',
      '--fieldtype',
      'LongTextArea',
      '--outputdir',
      path.join('shortFlagDir', 'Short_Flag_Test__mdt'),
    ])
    .command([
      'force:cmdt:field:create',
      '--fieldname',
      'Url',
      '--fieldtype',
      'Url',
      '--outputdir',
      path.join('shortFlagDir', 'Short_Flag_Test__mdt'),
    ])
    .command([
      'force:cmdt:record:create',
      '-t',
      'Short_Flag_Test',
      '-n',
      'Short_Flag_Test_Record',
      '-l',
      'Short Flag Test Record Label',
      '-p',
      'true',
      '-i',
      'shortFlagDir',
      '-d',
      path.join('shortFlagDir', 'customMetadata'),
    ])
    .it('runs force:cmdt:record:create with short flags', (ctx) => {
      const fieldDirPath = 'shortFlagDir';
      const filePath = path.join(
        'shortFlagDir',
        'customMetadata',
        'Short_Flag_Test.Short_Flag_Test_Record.md-meta.xml'
      );

      expect(fs.existsSync(fieldDirPath)).to.be.true;
      expect(fs.existsSync(filePath)).to.be.true;
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .finally(() => fs.rmSync('suffixTestDir', { recursive: true, force: true }))
    .stdout()
    .command(['force:cmdt:create', '--typename', 'Suffix_Test', '--outputdir', 'suffixTestDir'])
    .command([
      'force:cmdt:field:create',
      '--fieldname',
      'Check',
      '--fieldtype',
      'Checkbox',
      '--outputdir',
      path.join('suffixTestDir', 'Suffix_Test__mdt'),
    ])
    .command([
      'force:cmdt:record:create',
      '-t',
      'Suffix_Test__mdt',
      '-n',
      'Suffix_Test_Record',
      '-l',
      'Suffix Test Record Label',
      '-p',
      'true',
      '-i',
      'suffixTestDir',
      '-d',
      path.join('suffixTestDir', 'customMetadata'),
    ])
    .it(
      'runs force:cmdt:record:create and accepts a typename with a __mdt suffix, but removes that suffix during record creation',
      (ctx) => {
        const fieldDirPath = 'suffixTestDir';
        const filePath = path.join('suffixTestDir', 'customMetadata', 'Suffix_Test.Suffix_Test_Record.md-meta.xml');

        expect(fs.existsSync(fieldDirPath)).to.be.true;
        expect(fs.existsSync(filePath)).to.be.true;
      }
    );
});

describe('sfdx force:cmdt:record:create test contents of record file created', () => {
  test
    .withOrg({ username: 'test@org.com' }, true)
    .finally(() => fs.rmSync('outputTestDir', { recursive: true, force: true }))
    .stdout()
    .command(['force:cmdt:create', '--typename', 'Output_Test', '--outputdir', 'outputTestDir'])
    .command([
      'force:cmdt:field:create',
      '--fieldname',
      'Check',
      '--fieldtype',
      'Checkbox',
      '--outputdir',
      path.join('outputTestDir', 'Output_Test__mdt'),
    ])
    .command([
      'force:cmdt:record:create',
      '-t',
      'Output_Test',
      '-n',
      'Output_Test_Record',
      '-i',
      'outputTestDir',
      '-d',
      path.join('outputTestDir', 'customMetadata'),
    ])
    .it('should create records without optional flags', () => {
      const fieldDirPath = path.join('outputTestDir', 'Output_Test__mdt', 'fields');
      const filePath = path.join(fieldDirPath, 'Check__c.field-meta.xml');

      expect(fs.existsSync(fieldDirPath)).to.be.true;
      expect(fs.existsSync(filePath)).to.be.true;

      fs.readFile(filePath, { encoding: 'utf-8' }, function (err, xml) {
        expect(xml.includes('<fullName>Check__c</fullName>')).to.be.true;
        expect(xml.includes('<fieldManageability>DeveloperControlled</fieldManageability>')).to.be.true;
        expect(xml.includes('<label>Check</label>')).to.be.true;
        expect(xml.includes('<type>Checkbox</type>')).to.be.true;
        expect(xml.includes('<defaultValue>false</defaultValue>')).to.be.true;
      });
    });
});
