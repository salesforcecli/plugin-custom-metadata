import { expect, test } from '@salesforce/command/lib/test';
import * as fs from 'fs';
import { promisify } from 'util';

const child_process = require('child_process');
const exec = promisify(child_process.exec);

describe('sfdx force:cmdt:record:create', () => {

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .withProject()
    .command(['force:cmdt:create', '--devname', 'Foo', '--outputdir', 'cmdtObjects'])
    .command(['force:cmdt:field:create', '--fieldname', 'Check', '--fieldtype', 'Checkbox', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Date', '--fieldtype', 'Date', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Date_Time', '--fieldtype', 'DateTime', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Email', '--fieldtype', 'Email', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Number_Int', '--fieldtype', 'Number', '--decimalplaces', '0', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Number_Int_No_Flag', '--fieldtype', 'Number', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Number_Double', '--fieldtype', 'Number', '--decimalplaces', '4', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Percent_Int', '--fieldtype', 'Percent', '--decimalplaces', '0', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Percent_Int_No_Flag', '--fieldtype', 'Percent', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Percent_Double', '--fieldtype', 'Percent', '--decimalplaces', '2', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Phone', '--fieldtype', 'Phone', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Picklist', '--fieldtype', 'Picklist', '--picklistvalues', 'Foo', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Text', '--fieldtype', 'Text', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Textarea', '--fieldtype', 'TextArea', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Long_Textarea', '--fieldtype', 'LongTextArea', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Url', '--fieldtype', 'Url', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command([
      'force:cmdt:record:create',
      '--typename', 'Foo',
      '--recname', 'FooTest',
      '--label', 'FooTest1',
      '--protection', 'true',
      '--inputdir', 'cmdtObjects',
      '--outputdir', 'cmdtRecords'
    ])
    .it('runs force:cmdt:record:create with long flags', async (ctx) => {
      const fieldDirPath = 'cmdtObjects';
      const filePath = 'cmdtRecords/Foo.FooTest.md-meta.xml';

      expect(fs.existsSync(fieldDirPath)).to.be.true;
      expect(fs.existsSync(filePath)).to.be.true;

      await exec(`rm -rf ${fieldDirPath}`);
      await exec(`rm -rf cmdtRecords`);
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .withProject()
    .command(['force:cmdt:create', '--devname', 'Foo', '--outputdir', 'cmdtObjects'])
    .command(['force:cmdt:field:create', '--fieldname', 'Check', '--fieldtype', 'Checkbox', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Date', '--fieldtype', 'Date', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Date_Time', '--fieldtype', 'DateTime', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Email', '--fieldtype', 'Email', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Number_Int', '--fieldtype', 'Number', '--decimalplaces', '0', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Number_Int_No_Flag', '--fieldtype', 'Number', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Number_Double', '--fieldtype', 'Number', '--decimalplaces', '4', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Percent_Int', '--fieldtype', 'Percent', '--decimalplaces', '0', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Percent_Int_No_Flag', '--fieldtype', 'Percent', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Percent_Double', '--fieldtype', 'Percent', '--decimalplaces', '2', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Phone', '--fieldtype', 'Phone', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Picklist', '--fieldtype', 'Picklist', '--picklistvalues', 'Foo', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Text', '--fieldtype', 'Text', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Textarea', '--fieldtype', 'TextArea', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Long_Textarea', '--fieldtype', 'LongTextArea', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Url', '--fieldtype', 'Url', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command([
      'force:cmdt:record:create',
      '-t', 'Foo',
      '-r', 'FooTest',
      '-l', 'FooTest1',
      '-p', 'true',
      '-n', 'cmdtObjects',
      '-d', 'cmdtRecords'
    ])
    .it('runs force:cmdt:record:create with short flags', async (ctx) => {
      const fieldDirPath = 'cmdtObjects';
      const filePath = 'cmdtRecords/Foo.FooTest.md-meta.xml';

      expect(fs.existsSync(fieldDirPath)).to.be.true;
      expect(fs.existsSync(filePath)).to.be.true;

      await exec(`rm -rf ${fieldDirPath}`);
      await exec(`rm -rf cmdtRecords`);
    });

    // __mdt
    test
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .withProject()
    .command(['force:cmdt:create', '--devname', 'Foo', '--outputdir', 'cmdtObjects'])
    .command(['force:cmdt:field:create', '--fieldname', 'Check', '--fieldtype', 'Checkbox', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Date', '--fieldtype', 'Date', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Date_Time', '--fieldtype', 'DateTime', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Email', '--fieldtype', 'Email', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Number_Int', '--fieldtype', 'Number', '--decimalplaces', '0', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Number_Int_No_Flag', '--fieldtype', 'Number', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Number_Double', '--fieldtype', 'Number', '--decimalplaces', '4', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Percent_Int', '--fieldtype', 'Percent', '--decimalplaces', '0', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Percent_Int_No_Flag', '--fieldtype', 'Percent', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Percent_Double', '--fieldtype', 'Percent', '--decimalplaces', '2', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Phone', '--fieldtype', 'Phone', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Picklist', '--fieldtype', 'Picklist', '--picklistvalues', 'Foo', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Text', '--fieldtype', 'Text', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Textarea', '--fieldtype', 'TextArea', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Long_Textarea', '--fieldtype', 'LongTextArea', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command(['force:cmdt:field:create', '--fieldname', 'Url', '--fieldtype', 'Url', '--outputdir', 'cmdtObjects/Foo__mdt'])
    .command([
      'force:cmdt:record:create',
      '-t', 'Foo__mdt',
      '-r', 'FooTest',
      '-l', 'FooTest1',
      '-p', 'true',
      '-n', 'cmdtObjects',
      '-d', 'cmdtRecords'
    ])
    .it('runs force:cmdt:record:create and accepts a typename with a __mdt suffix', async (ctx) => {
      const fieldDirPath = 'cmdtObjects';
      const filePath = 'cmdtRecords/Foo.FooTest.md-meta.xml';

      expect(fs.existsSync(fieldDirPath)).to.be.true;
      expect(fs.existsSync(filePath)).to.be.true;

      await exec(`rm -rf ${fieldDirPath}`);
      await exec(`rm -rf cmdtRecords`);
    });
});
