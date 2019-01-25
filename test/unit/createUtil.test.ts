import { expect, test } from '@salesforce/command/lib/test';
import { CreateUtil } from '../../src/lib/helpers/createUtil';
import { FileWriter } from '../../src/lib/helpers/fileWriter';
import { core } from '@salesforce/command';
import * as fs from 'fs';
import { promisify } from 'util';

const child_process = require('child_process');
const exec = promisify(child_process.exec);

describe('CreateUtil', () => {

  describe('appendDirectorySuffix', () => {
    it('should append a suffix of __mdt if id does not already exist', async () => {
      const createUtil = new CreateUtil();
      const output1 = createUtil.appendDirectorySuffix('foo');
      const output2 = createUtil.appendDirectorySuffix('bar__mdt');

      expect(output1 === 'foo__mdt').to.be.true;
      expect(output2 === 'bar__mdt').to.be.true;
    });
  });

  describe('getFieldType', () => {
    test
      .withOrg({
        username: 'test@org.com'
      }, true)
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
      .it('should return the field type needed to create a custom metadata type record', async () => {
        const createUtil = new CreateUtil();
        const fileWriter = new FileWriter();
        const typename = 'Foo';
        const recname = 'FooTest';
        const label = 'Foo Test';
        const protection = true;
        const inputdir = 'cmdtObjects';
        const outputdir = 'cmdtObjects/customMetadata';
        const dirName = createUtil.appendDirectorySuffix(typename);
        const fieldDirPath = `${fileWriter.createDir(inputdir)}${dirName}/fields`;
        const fileNames = await core.fs.readdir(fieldDirPath);
        const varargs = {
          Check__c: true,
          Date_Time__c: '2019-01-21T18:37:00.000Z',
          Date__c: '2019-01-21',
          Email__c: 'm@m.com',
          Number__c: 42,
          Percent__c: 29,
          Phone__c: '423-903-0870',
          Text__c: 'Hello',
          Textarea_Long__c: 'HelloWorld',
          Textarea__c: 'HelloWorld',
          URL__c: 'https://salesforce.com/',
          Picklist__c: 'Foo',
          Double__c: 42.23,
          Percent_Double__c: 78.91
        };

        await core.fs.mkdirp(outputdir);

        const fileData = await createUtil.getFileData(fieldDirPath, fileNames);

        await createUtil.createRecord({
          typename,
          recname,
          label,
          inputdir,
          outputdir,
          protection,
          varargs,
          fileData
        });

        const field1 = createUtil.getFieldType(fileData, 'Check__c');
        const field2 = createUtil.getFieldType(fileData, 'Date_Time__c');
        const field3 = createUtil.getFieldType(fileData, 'Date__c');
        const field4 = createUtil.getFieldType(fileData, 'Email__c');
        const field5 = createUtil.getFieldType(fileData, 'Number_Int__c');
        const field6 = createUtil.getFieldType(fileData, 'Number_Int_No_Flag__c');
        const field7 = createUtil.getFieldType(fileData, 'Number_Double__c');
        const field8 = createUtil.getFieldType(fileData, 'Percent_Int__c');
        const field9 = createUtil.getFieldType(fileData, 'Percent_Int_No_Flag__c');
        const field10 = createUtil.getFieldType(fileData, 'Percent_Double__c');
        const field11 = createUtil.getFieldType(fileData, 'Phone__c');
        const field12 = createUtil.getFieldType(fileData, 'Picklist__c');
        const field13 = createUtil.getFieldType(fileData, 'Text__c');
        const field14 = createUtil.getFieldType(fileData, 'TextArea__c');
        const field15 = createUtil.getFieldType(fileData, 'LongTextArea__c');
        const field16 = createUtil.getFieldType(fileData, 'Url__c');
        const fileTypeFallback = createUtil.getFieldType(fileData, 'Field_Does_Not_Exist__c');

        expect(field1 === 'boolean').to.be.true;
        expect(field2 === 'dateTime').to.be.true;
        expect(field3 === 'date').to.be.true;
        expect(field4 === 'string').to.be.true;
        expect(field5 === 'int').to.be.true;
        expect(field6 === 'int').to.be.true;
        expect(field7 === 'double').to.be.true;
        expect(field8 === 'int').to.be.true;
        expect(field9 === 'int').to.be.true;
        expect(field10 === 'double').to.be.true;
        expect(field11 === 'string').to.be.true;
        expect(field12 === 'string').to.be.true;
        expect(field13 === 'string').to.be.true;
        expect(field14 === 'string').to.be.true;
        expect(field15 === 'string').to.be.true;
        expect(field16 === 'string').to.be.true;
        expect(fileTypeFallback === 'string').to.be.true;

        await exec(`rm -rf ${outputdir}`);
      });
  });

  describe('createRecord', () => {
    test
      .withOrg({username: 'test@org.com'}, true)
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
    it('should create a customMetadata directory and a file for custom metadata type', async () => {
      // create input directory with cmdt object and fields
      const createUtil = new CreateUtil();
      const fileWriter = new FileWriter();
      const typename = 'Foo';
      const recname = 'FooTest';
      const label = 'Foo Test';
      const protection = true;
      const inputdir = 'cmdtObjects';
      const outputdir = 'cmdtRecords';
      const dirName = createUtil.appendDirectorySuffix(typename);
      const fieldDirPath = `${fileWriter.createDir(inputdir)}${dirName}/fields`;
      const fileNames = await core.fs.readdir(fieldDirPath);
      const varargs = {
        Check__c: true,
        Date_Time__c: '2019-01-21T18:37:00.000Z',
        Date__c: '2019-01-21',
        Email__c: 'm@m.com',
        Number__c: 42,
        Percent__c: 29,
        Phone__c: '423-903-0870',
        Text__c: 'Hello',
        Textarea_Long__c: 'HelloWorld',
        Textarea__c: 'HelloWorld',
        URL__c: 'https://salesforce.com/',
        Picklist__c: 'Foo',
        Double__c: 42.23,
        Percent_Double__c: 78.91
      };

      await core.fs.mkdirp(outputdir);

      const fileData = await createUtil.getFileData(fieldDirPath, fileNames);

      await createUtil.createRecord({
        typename,
        recname,
        label,
        inputdir,
        outputdir,
        protection,
        varargs,
        fileData
      });

      const filePath = `${outputdir}/${typename}.${recname}.md-meta.xml`;

      expect(fs.existsSync(fieldDirPath)).to.be.true;
      expect(fs.existsSync(filePath)).to.be.true;

      await exec(`rm -rf ${inputdir}`);
      await exec(`rm -rf ${outputdir}`);
    });
  });

});
