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
import { CreateUtil } from '../../src/lib/helpers/createUtil';
import { FileWriter } from '../../src/lib/helpers/fileWriter';

describe('CreateUtil', () => {
  describe('appendDirectorySuffix', () => {
    it('should append a suffix of __mdt if id does not already exist', async () => {
      const createUtil = new CreateUtil();
      const output1 = createUtil.appendDirectorySuffix('foo');
      const output2 = createUtil.appendDirectorySuffix('foobar__mdt');

      expect(output1 === 'foo__mdt').to.be.true;
      expect(output2 === 'foobar__mdt').to.be.true;
    });
  });

  describe('getFieldPrimitiveType', () => {
    test
      .withOrg(
        {
          username: 'test@org.com',
        },
        true
      )
      .stdout()
      // .withProject()
      .command(['force:cmdt:create', '--typename', 'Field_Type_Test', '--outputdir', 'fieldTypeTest'])
      .command([
        'force:cmdt:field:create',
        '--fieldname',
        'Check',
        '--fieldtype',
        'Checkbox',
        '--outputdir',
        'fieldTypeTest/Field_Type_Test__mdt',
      ])
      .command([
        'force:cmdt:field:create',
        '--fieldname',
        'Date',
        '--fieldtype',
        'Date',
        '--outputdir',
        'fieldTypeTest/Field_Type_Test__mdt',
      ])
      .command([
        'force:cmdt:field:create',
        '--fieldname',
        'Date_Time',
        '--fieldtype',
        'DateTime',
        '--outputdir',
        'fieldTypeTest/Field_Type_Test__mdt',
      ])
      .command([
        'force:cmdt:field:create',
        '--fieldname',
        'Email',
        '--fieldtype',
        'Email',
        '--outputdir',
        'fieldTypeTest/Field_Type_Test__mdt',
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
        'fieldTypeTest/Field_Type_Test__mdt',
      ])
      .command([
        'force:cmdt:field:create',
        '--fieldname',
        'Number_Int_No_Flag',
        '--fieldtype',
        'Number',
        '--outputdir',
        'fieldTypeTest/Field_Type_Test__mdt',
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
        'fieldTypeTest/Field_Type_Test__mdt',
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
        'fieldTypeTest/Field_Type_Test__mdt',
      ])
      .command([
        'force:cmdt:field:create',
        '--fieldname',
        'Percent_Int_No_Flag',
        '--fieldtype',
        'Percent',
        '--outputdir',
        'fieldTypeTest/Field_Type_Test__mdt',
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
        'fieldTypeTest/Field_Type_Test__mdt',
      ])
      .command([
        'force:cmdt:field:create',
        '--fieldname',
        'Phone',
        '--fieldtype',
        'Phone',
        '--outputdir',
        'fieldTypeTest/Field_Type_Test__mdt',
      ])
      .command([
        'force:cmdt:field:create',
        '--fieldname',
        'Picklist',
        '--fieldtype',
        'Picklist',
        '--picklistvalues',
        'Foo',
        '--outputdir',
        'fieldTypeTest/Field_Type_Test__mdt',
      ])
      .command([
        'force:cmdt:field:create',
        '--fieldname',
        'Text',
        '--fieldtype',
        'Text',
        '--outputdir',
        'fieldTypeTest/Field_Type_Test__mdt',
      ])
      .command([
        'force:cmdt:field:create',
        '--fieldname',
        'Textarea',
        '--fieldtype',
        'TextArea',
        '--outputdir',
        'fieldTypeTest/Field_Type_Test__mdt',
      ])
      .command([
        'force:cmdt:field:create',
        '--fieldname',
        'Long_Textarea',
        '--fieldtype',
        'LongTextArea',
        '--outputdir',
        'fieldTypeTest/Field_Type_Test__mdt',
      ])
      .command([
        'force:cmdt:field:create',
        '--fieldname',
        'Url',
        '--fieldtype',
        'Url',
        '--outputdir',
        'fieldTypeTest/Field_Type_Test__mdt',
      ])
      .it('should return the field type needed to create a custom metadata type record', async () => {
        const createUtil = new CreateUtil();
        const fileWriter = new FileWriter();
        const typename = 'Field_Type_Test';
        const recordname = 'Field_Type_Test_Record';
        const label = 'Field Type Test Label';
        const protectedFlag = true;
        const inputdir = 'fieldTypeTest';
        const outputdir = path.join('fieldTypeTest', 'customMetadata');
        const dirName = createUtil.appendDirectorySuffix(typename);
        const fieldDirPath = path.join(`${fileWriter.createDir(inputdir)}${dirName}`, 'fields');
        const fileNames = await fs.promises.readdir(fieldDirPath);
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
          Percent_Double__c: 78.91,
        };

        await fs.promises.mkdir(outputdir, { recursive: true });

        const fileData = await createUtil.getFileData(fieldDirPath, fileNames);

        await createUtil.createRecord({
          typename,
          recordname,
          label,
          inputdir,
          outputdir,
          protected: protectedFlag,
          varargs,
          fileData,
        });

        const field1 = createUtil.getFieldPrimitiveType(fileData, 'Check__c');
        const field2 = createUtil.getFieldPrimitiveType(fileData, 'Date_Time__c');
        const field3 = createUtil.getFieldPrimitiveType(fileData, 'Date__c');
        const field4 = createUtil.getFieldPrimitiveType(fileData, 'Email__c');
        const field5 = createUtil.getFieldPrimitiveType(fileData, 'Number_Int__c');
        const field6 = createUtil.getFieldPrimitiveType(fileData, 'Number_Int_No_Flag__c');
        const field7 = createUtil.getFieldPrimitiveType(fileData, 'Number_Double__c');
        const field8 = createUtil.getFieldPrimitiveType(fileData, 'Percent_Int__c');
        const field9 = createUtil.getFieldPrimitiveType(fileData, 'Percent_Int_No_Flag__c');
        const field10 = createUtil.getFieldPrimitiveType(fileData, 'Percent_Double__c');
        const field11 = createUtil.getFieldPrimitiveType(fileData, 'Phone__c');
        const field12 = createUtil.getFieldPrimitiveType(fileData, 'Picklist__c');
        const field13 = createUtil.getFieldPrimitiveType(fileData, 'Text__c');
        const field14 = createUtil.getFieldPrimitiveType(fileData, 'TextArea__c');
        const field15 = createUtil.getFieldPrimitiveType(fileData, 'LongTextArea__c');
        const field16 = createUtil.getFieldPrimitiveType(fileData, 'Url__c');
        const fileTypeFallback = createUtil.getFieldPrimitiveType(fileData, 'Field_Does_Not_Exist__c');

        expect(field1).to.equal('boolean');
        expect(field2).to.equal('dateTime');
        expect(field3).to.equal('date');
        expect(field4).to.equal('string');
        expect(field5).to.equal('int');
        expect(field6).to.equal('int');
        expect(field7).to.equal('double');
        expect(field8).to.equal('int');
        expect(field9).to.equal('int');
        expect(field10).to.equal('double');
        expect(field11).to.equal('string');
        expect(field12).to.equal('string');
        expect(field13).to.equal('string');
        expect(field14).to.equal('string');
        expect(field15).to.equal('string');
        expect(field16).to.equal('string');
        expect(fileTypeFallback).to.equal('string');

        await fs.promises.rm(inputdir, { recursive: true });
      });
  });

  describe('getFieldDataType', () => {
    test
      .withOrg(
        {
          username: 'test@org.com',
        },
        true
      )
      .stdout()
      // .withProject()
      .command(['force:cmdt:create', '--typename', 'Field_Type_Test', '--outputdir', 'fieldTypeTest'])
      .command([
        'force:cmdt:field:create',
        '--fieldname',
        'Check',
        '--fieldtype',
        'Checkbox',
        '--outputdir',
        'fieldTypeTest/Field_Type_Test__mdt',
      ])
      .command([
        'force:cmdt:field:create',
        '--fieldname',
        'Date',
        '--fieldtype',
        'Date',
        '--outputdir',
        'fieldTypeTest/Field_Type_Test__mdt',
      ])
      .command([
        'force:cmdt:field:create',
        '--fieldname',
        'Date_Time',
        '--fieldtype',
        'DateTime',
        '--outputdir',
        'fieldTypeTest/Field_Type_Test__mdt',
      ])
      .command([
        'force:cmdt:field:create',
        '--fieldname',
        'Email',
        '--fieldtype',
        'Email',
        '--outputdir',
        'fieldTypeTest/Field_Type_Test__mdt',
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
        'fieldTypeTest/Field_Type_Test__mdt',
      ])
      .command([
        'force:cmdt:field:create',
        '--fieldname',
        'Number_Int_No_Flag',
        '--fieldtype',
        'Number',
        '--outputdir',
        'fieldTypeTest/Field_Type_Test__mdt',
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
        'fieldTypeTest/Field_Type_Test__mdt',
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
        'fieldTypeTest/Field_Type_Test__mdt',
      ])
      .command([
        'force:cmdt:field:create',
        '--fieldname',
        'Percent_Int_No_Flag',
        '--fieldtype',
        'Percent',
        '--outputdir',
        'fieldTypeTest/Field_Type_Test__mdt',
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
        'fieldTypeTest/Field_Type_Test__mdt',
      ])
      .command([
        'force:cmdt:field:create',
        '--fieldname',
        'Phone',
        '--fieldtype',
        'Phone',
        '--outputdir',
        'fieldTypeTest/Field_Type_Test__mdt',
      ])
      .command([
        'force:cmdt:field:create',
        '--fieldname',
        'Picklist',
        '--fieldtype',
        'Picklist',
        '--picklistvalues',
        'Foo',
        '--outputdir',
        'fieldTypeTest/Field_Type_Test__mdt',
      ])
      .command([
        'force:cmdt:field:create',
        '--fieldname',
        'Text',
        '--fieldtype',
        'Text',
        '--outputdir',
        'fieldTypeTest/Field_Type_Test__mdt',
      ])
      .command([
        'force:cmdt:field:create',
        '--fieldname',
        'Textarea',
        '--fieldtype',
        'TextArea',
        '--outputdir',
        'fieldTypeTest/Field_Type_Test__mdt',
      ])
      .command([
        'force:cmdt:field:create',
        '--fieldname',
        'Long_Textarea',
        '--fieldtype',
        'LongTextArea',
        '--outputdir',
        'fieldTypeTest/Field_Type_Test__mdt',
      ])
      .command([
        'force:cmdt:field:create',
        '--fieldname',
        'Url',
        '--fieldtype',
        'Url',
        '--outputdir',
        'fieldTypeTest/Field_Type_Test__mdt',
      ])
      .it('should return the field type needed to create a custom metadata type record', async () => {
        const createUtil = new CreateUtil();
        const fileWriter = new FileWriter();
        const typename = 'Field_Type_Test';
        const recordname = 'Field_Type_Test_Record';
        const label = 'Field Type Test Label';
        const protectedFlag = true;
        const inputdir = 'fieldTypeTest';
        const outputdir = path.join('fieldTypeTest', 'customMetadata');
        const dirName = createUtil.appendDirectorySuffix(typename);
        const fieldDirPath = path.join(`${fileWriter.createDir(inputdir)}${dirName}`, 'fields');
        const fileNames = await fs.promises.readdir(fieldDirPath);
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
          Percent_Double__c: 78.91,
        };

        await fs.promises.mkdir(outputdir, { recursive: true });

        const fileData = await createUtil.getFileData(fieldDirPath, fileNames);

        await createUtil.createRecord({
          typename,
          recordname,
          label,
          inputdir,
          outputdir,
          protected: protectedFlag,
          varargs,
          fileData,
        });

        const field1 = createUtil.getFieldDataType(fileData, 'Check__c');
        const field2 = createUtil.getFieldDataType(fileData, 'Date_Time__c');
        const field3 = createUtil.getFieldDataType(fileData, 'Date__c');
        const field4 = createUtil.getFieldDataType(fileData, 'Email__c');
        const field5 = createUtil.getFieldDataType(fileData, 'Number_Int__c');
        const field6 = createUtil.getFieldDataType(fileData, 'Number_Int_No_Flag__c');
        const field7 = createUtil.getFieldDataType(fileData, 'Number_Double__c');
        const field8 = createUtil.getFieldDataType(fileData, 'Percent_Int__c');
        const field9 = createUtil.getFieldDataType(fileData, 'Percent_Int_No_Flag__c');
        const field10 = createUtil.getFieldDataType(fileData, 'Percent_Double__c');
        const field11 = createUtil.getFieldDataType(fileData, 'Phone__c');
        const field12 = createUtil.getFieldDataType(fileData, 'Picklist__c');
        const field13 = createUtil.getFieldDataType(fileData, 'Text__c');
        const field14 = createUtil.getFieldDataType(fileData, 'Url__c');

        expect(field1).to.equal('Checkbox');
        expect(field2).to.equal('DateTime');
        expect(field3).to.equal('Date');
        expect(field4).to.equal('Email');
        expect(field5).to.equal('Number');
        expect(field6).to.equal('Number');
        expect(field7).to.equal('Number');
        expect(field8).to.equal('Percent');
        expect(field9).to.equal('Percent');
        expect(field10).to.equal('Percent');
        expect(field11).to.equal('Phone');
        expect(field12).to.equal('Picklist');
        expect(field13).to.equal('Text');
        expect(field14).to.equal('Url');

        await fs.promises.rm(inputdir, { recursive: true });
      });
  });

  describe('createDefaultType', () => {
    test
      .withOrg(
        {
          username: 'test@org.com',
        },
        true
      )
      .stdout()
      // .withProject()
      .command(['force:cmdt:create', '--typename', 'Default_Type', '--outputdir', 'defaultTypes'])
      .command([
        'force:cmdt:field:create',
        '--fieldname',
        'Check',
        '--fieldtype',
        'Checkbox',
        '--outputdir',
        'defaultTypes/Default_Type__mdt',
      ])
      .it(
        'should handle an empty array return the field type needed to create a custom metadata type record',
        async () => {
          const createUtil = new CreateUtil();
          const inputdir = 'defaultTypes';
          const field1 = createUtil.getFieldPrimitiveType();

          expect(field1 === 'string').to.be.true;

          await fs.promises.rm(inputdir, { recursive: true });
        }
      );
  });

  describe('createRecord', () => {
    test
      .withOrg({ username: 'test@org.com' }, true)
      .stdout()
      // .withProject()
      .command(['force:cmdt:create', '--typename', 'Dir_File_Test', '--outputdir', 'dirFileTest'])
      .command([
        'force:cmdt:field:create',
        '--fieldname',
        'Check',
        '--fieldtype',
        'Checkbox',
        '--outputdir',
        'dirFileTest/Dir_File_Test__mdt',
      ])
      .command([
        'force:cmdt:field:create',
        '--fieldname',
        'Date',
        '--fieldtype',
        'Date',
        '--outputdir',
        'dirFileTest/Dir_File_Test__mdt',
      ])
      .command([
        'force:cmdt:field:create',
        '--fieldname',
        'Date_Time',
        '--fieldtype',
        'DateTime',
        '--outputdir',
        'dirFileTest/Dir_File_Test__mdt',
      ])
      .command([
        'force:cmdt:field:create',
        '--fieldname',
        'Email',
        '--fieldtype',
        'Email',
        '--outputdir',
        'dirFileTest/Dir_File_Test__mdt',
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
        'dirFileTest/Dir_File_Test__mdt',
      ])
      .command([
        'force:cmdt:field:create',
        '--fieldname',
        'Number_Int_No_Flag',
        '--fieldtype',
        'Number',
        '--outputdir',
        'dirFileTest/Dir_File_Test__mdt',
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
        'dirFileTest/Dir_File_Test__mdt',
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
        'dirFileTest/Dir_File_Test__mdt',
      ])
      .command([
        'force:cmdt:field:create',
        '--fieldname',
        'Percent_Int_No_Flag',
        '--fieldtype',
        'Percent',
        '--outputdir',
        'dirFileTest/Dir_File_Test__mdt',
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
        'dirFileTest/Dir_File_Test__mdt',
      ])
      .command([
        'force:cmdt:field:create',
        '--fieldname',
        'Phone',
        '--fieldtype',
        'Phone',
        '--outputdir',
        'dirFileTest/Dir_File_Test__mdt',
      ])
      .command([
        'force:cmdt:field:create',
        '--fieldname',
        'Picklist',
        '--fieldtype',
        'Picklist',
        '--picklistvalues',
        'Dir_File_Test',
        '--outputdir',
        'dirFileTest/Dir_File_Test__mdt',
      ])
      .command([
        'force:cmdt:field:create',
        '--fieldname',
        'Text',
        '--fieldtype',
        'Text',
        '--outputdir',
        'dirFileTest/Dir_File_Test__mdt',
      ])
      .command([
        'force:cmdt:field:create',
        '--fieldname',
        'Textarea',
        '--fieldtype',
        'TextArea',
        '--outputdir',
        'dirFileTest/Dir_File_Test__mdt',
      ])
      .command([
        'force:cmdt:field:create',
        '--fieldname',
        'Long_Textarea',
        '--fieldtype',
        'LongTextArea',
        '--outputdir',
        'dirFileTest/Dir_File_Test__mdt',
      ])
      .command([
        'force:cmdt:field:create',
        '--fieldname',
        'Url',
        '--fieldtype',
        'Url',
        '--outputdir',
        'dirFileTest/Dir_File_Test__mdt',
      ])
      .it('should create a customMetadata directory and a file for custom metadata type', async () => {
        // create input directory with cmdt object and fields
        const createUtil = new CreateUtil();
        const fileWriter = new FileWriter();
        const typename = 'Dir_File_Test';
        const recordname = 'Dir_File_Test_Record';
        const label = 'Dir File Test Record Label';
        const protectedFlag = true;
        const inputdir = 'dirFileTest';
        const outputdir = 'dirFileTest/cmdtRecords';
        const dirName = createUtil.appendDirectorySuffix(typename);
        const fieldDirPath = path.join(`${fileWriter.createDir(inputdir)}${dirName}`, 'fields');
        const fileNames = await fs.promises.readdir(fieldDirPath);
        const varargs = {
          Check__c: true,
          Date_Time__c: '2019-01-21T18:37:00.000Z',
          Date__c: '2019-01-21',
          Email__c: 'm@m.com',
          Number__c: 42,
          Percent__c: 29,
          Phone__c: '423-903-0870',
          Text__c: '',
          Textarea_Long__c: 'HelloWorld',
          Textarea__c: 'HelloWorld',
          URL__c: 'https://salesforce.com/',
          Picklist__c: 'Foo',
          Double__c: 42.23,
          Percent_Double__c: 78.91,
        };

        await fs.promises.mkdir(outputdir, { recursive: true });

        const fileData = await createUtil.getFileData(fieldDirPath, fileNames);

        await createUtil.createRecord({
          typename,
          recordname,
          label,
          inputdir,
          outputdir,
          protected: protectedFlag,
          varargs,
          fileData,
        });

        const filePath = `${outputdir}/${typename}.${recordname}.md-meta.xml`;

        expect(fs.existsSync(fieldDirPath)).to.be.true;
        expect(fs.existsSync(filePath)).to.be.true;

        await fs.promises.rm(inputdir, { recursive: true });
      });
  });
});
