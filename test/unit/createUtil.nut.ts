/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/* eslint-disable camelcase */

import * as fs from 'fs';
import * as path from 'path';
import { expect, config } from 'chai';
import { TestSession, execCmd } from '@salesforce/cli-plugins-testkit';
import { CustomField } from 'jsforce/lib/api/metadata';
import {
  appendDirectorySuffix,
  getFieldPrimitiveType,
  createRecord,
  getFieldDataType,
  getFileData,
} from '../../src/lib/helpers/createUtil';
import { createOneOfEveryField } from '../helpers/fieldCreation';

let session: TestSession;
let projDir: string;
config.truncateThreshold = 0;
let fileData: CustomField[];

describe('CreateUtil', () => {
  let outputDir: string;
  let typename: string;
  let recordname: string;
  let fieldDirPath: string;

  before(async () => {
    session = await TestSession.create({
      project: {
        name: 'cmdtRecordCreate',
      },
      devhubAuthStrategy: 'NONE',
    });
    projDir = session.project?.dir ?? '';
    const inputdir = 'fieldTypeTest';
    execCmd(`force:cmdt:create --typename Field_Type_Test --outputdir ${inputdir}`);
    createOneOfEveryField(path.join(inputdir, 'Field_Type_Test__mdt'));
    typename = 'Field_Type_Test';
    recordname = 'Field_Type_Test_Record';
    const label = 'Field Type Test Label';
    const protectedFlag = true;
    const dirName = appendDirectorySuffix(typename);
    fieldDirPath = path.join(projDir, inputdir, dirName, 'fields');
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
    outputDir = path.join(projDir, inputdir, 'customMetadata');

    await fs.promises.mkdir(outputDir, { recursive: true });

    fileData = await getFileData(fieldDirPath, fileNames);

    await createRecord({
      typename,
      recordname,
      label,
      inputdir,
      outputdir: outputDir,
      protected: protectedFlag,
      varargs,
      fileData,
    });
  });

  after(async () => {
    await session.zip(undefined, 'artifacts');
    await session.clean();
  });

  it('getFieldPrimitiveType should return the field type needed to create a custom metadata type record', () => {
    expect(getFieldPrimitiveType(fileData, 'Check__c')).to.equal('boolean');
    expect(getFieldPrimitiveType(fileData, 'Date_Time__c')).to.equal('dateTime');
    expect(getFieldPrimitiveType(fileData, 'Date__c')).to.equal('date');
    expect(getFieldPrimitiveType(fileData, 'Email__c')).to.equal('string');
    expect(getFieldPrimitiveType(fileData, 'Number_Int__c')).to.equal('int');
    expect(getFieldPrimitiveType(fileData, 'Number_Int_No_Flag__c')).to.equal('int');
    expect(getFieldPrimitiveType(fileData, 'Number_Double__c')).to.equal('double');
    expect(getFieldPrimitiveType(fileData, 'Percent_Int__c')).to.equal('int');
    expect(getFieldPrimitiveType(fileData, 'Percent_Int_No_Flag__c')).to.equal('int');
    expect(getFieldPrimitiveType(fileData, 'Percent_Double__c')).to.equal('double');
    expect(getFieldPrimitiveType(fileData, 'Phone__c')).to.equal('string');
    expect(getFieldPrimitiveType(fileData, 'Picklist__c')).to.equal('string');
    expect(getFieldPrimitiveType(fileData, 'Text__c')).to.equal('string');
    expect(getFieldPrimitiveType(fileData, 'TextArea__c')).to.equal('string');
    expect(getFieldPrimitiveType(fileData, 'LongTextArea__c')).to.equal('string');
    expect(getFieldPrimitiveType(fileData, 'Url__c')).to.equal('string');
    expect(getFieldPrimitiveType(fileData, 'Field_Does_Not_Exist__c')).to.equal('string');
  });
  it('getFieldDataType should return the field type needed to create a custom metadata type record', () => {
    expect(getFieldDataType(fileData, 'Check__c')).to.equal('Checkbox');
    expect(getFieldDataType(fileData, 'Date_Time__c')).to.equal('DateTime');
    expect(getFieldDataType(fileData, 'Date__c')).to.equal('Date');
    expect(getFieldDataType(fileData, 'Email__c')).to.equal('Email');
    expect(getFieldDataType(fileData, 'Number_Int__c')).to.equal('Number');
    expect(getFieldDataType(fileData, 'Number_Int_No_Flag__c')).to.equal('Number');
    expect(getFieldDataType(fileData, 'Number_Double__c')).to.equal('Number');
    expect(getFieldDataType(fileData, 'Percent_Int__c')).to.equal('Percent');
    expect(getFieldDataType(fileData, 'Percent_Int_No_Flag__c')).to.equal('Percent');
    expect(getFieldDataType(fileData, 'Percent_Double__c')).to.equal('Percent');
    expect(getFieldDataType(fileData, 'Phone__c')).to.equal('Phone');
    expect(getFieldDataType(fileData, 'Picklist__c')).to.equal('Picklist');
    expect(getFieldDataType(fileData, 'Text__c')).to.equal('Text');
    expect(getFieldDataType(fileData, 'Url__c')).to.equal('Url');
  });

  it('should create a customMetadata directory and a file for custom metadata type', () => {
    const filePath = `${outputDir}/${typename}.${recordname}.md-meta.xml`;

    expect(fs.existsSync(fieldDirPath)).to.be.true;
    expect(fs.existsSync(filePath)).to.be.true;
  });

  describe('createDefaultType', () => {
    before(() => {
      execCmd('force:cmdt:create --typename Default_Type --outputdir defaultTypes', { ensureExitCode: 0 });
      execCmd(
        'force:cmdt:field:create --fieldname Check --fieldtype Checkbox --outputdir defaultTypes/Default_Type__mdt',
        { ensureExitCode: 0 }
      );
    });
    it('should handle an empty array return the field type needed to create a custom metadata type record', () => {
      const field1 = getFieldPrimitiveType();
      expect(field1 === 'string').to.be.true;
    });
  });
});
