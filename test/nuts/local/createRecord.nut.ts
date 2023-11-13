/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, config } from 'chai';
import { TestSession, execCmd } from '@salesforce/cli-plugins-testkit';
import { Messages } from '@salesforce/core';
import { createOneOfEveryField } from '../../helpers/fieldCreation.js';

Messages.importMessagesDirectory(path.dirname(fileURLToPath(import.meta.url)));
const validationMessages = Messages.loadMessages('@salesforce/plugin-custom-metadata', 'validation');
const commandMessages = Messages.loadMessages('@salesforce/plugin-custom-metadata', 'record');

let session: TestSession;
let projDir: string;
config.truncateThreshold = 0;

describe('cmdt record create', () => {
  before(async () => {
    session = await TestSession.create({
      project: {
        name: 'cmdtRecordCreate',
      },
      devhubAuthStrategy: 'NONE',
    });
    projDir = session.project?.dir ?? '';
  });

  after(async () => {
    await session.zip(undefined, 'artifacts');
    await session.clean();
  });

  describe('force:cmdt:record:create error handling', () => {
    it('runs force:cmdt:record:create and throws an error if the API name is invalid', () => {
      execCmd('force:cmdt:create --typename Bad_Dev_Name --outputdir badDevNameDir', { ensureExitCode: 0 });
      const badType = 'pbwbFgJM4GyDOaNZn60NjAy3Ciks791y_dKLsPmXS6';
      const result = execCmd(
        `force:cmdt:record:create -t ${badType} -n Foobar -l Foobar -p true -i badDevNameDir -d ${path.join(
          'badDevNameDir',
          'customMetadata'
        )}`,
        { ensureExitCode: 1 }
      );
      expect(result.shellOutput.stderr).to.contain(validationMessages.getMessage('invalidCMDTApiName', [badType]));
    });

    it('runs force:cmdt:record:create and throws an error if the record name is invalid', () => {
      execCmd('force:cmdt:create --typename Bad_Record_Name_Test --outputdir recordNameErrorDir', {
        ensureExitCode: 0,
      });
      execCmd(
        `force:cmdt:field:create --fieldname Check --fieldtype Checkbox --outputdir ${path.join(
          'recordNameErrorDir',
          'Bad_Record_Name_Test__mdt'
        )}`,
        { ensureExitCode: 0 }
      );
      const result = execCmd(
        `force:cmdt:record:create -t Bad_Record_Name_Test -n "Bad Record Name" -l Foobar -p true -i recordNameErrorDir -d ${path.join(
          'recordNameErrorDir',
          'customMetadata'
        )}`,
        { ensureExitCode: 1 }
      );
      expect(result.shellOutput.stderr).to.contain(
        validationMessages.getMessage('notAValidRecordNameError', ['Bad Record Name'])
      );
    });

    it('runs force:cmdt:record:create and throws an error if there are more than 40 characters in a label', () => {
      execCmd('force:cmdt:create --typename Exceed_Char_Test --outputdir exceedCharDir', {
        ensureExitCode: 0,
      });
      execCmd(
        `force:cmdt:field:create --fieldname Check --fieldtype Checkbox --outputdir ${path.join(
          'exceedCharDir',
          'Exceed_Char_Test__mdt'
        )}`,
        { ensureExitCode: 0 }
      );
      const result = execCmd(
        `force:cmdt:record:create -t Foo__mdt -n Foobar -l Foobarfoobarfoobarfoobarfoobarfoobarfoobarfoobarfoobar -p true -i exceedCharDir -d ${path.join(
          'exceedCharDir',
          'customMetadata'
        )}`,
        { ensureExitCode: 1 }
      );
      expect(result.shellOutput.stderr).to.contain(
        commandMessages.getMessage('notAValidLabelNameError', [
          'Foobarfoobarfoobarfoobarfoobarfoobarfoobarfoobarfoobar',
        ])
      );
    });
  });

  describe('sfdx force:cmdt:record:create', () => {
    it('runs force:cmdt:record:create with long flags', () => {
      const fieldDirPath = 'createWithLongFlags';
      const outputDir = path.join(fieldDirPath, 'Long_Flags_Create_Test__mdt');
      execCmd(`force:cmdt:create --typename Short_Flag_Test --outputdir ${fieldDirPath}`, { ensureExitCode: 0 });
      createOneOfEveryField(outputDir);
      const result = execCmd(
        `force:cmdt:record:create --typename Long_Flags_Create_Test --recordname Long_Flags_Create_Test_Record --label "Long Flags Create Test Record Label" --protected true --inputdir createWithLongFlags --outputdir ${path.join(
          fieldDirPath,
          'customMetadata'
        )}`,
        { ensureExitCode: 0 }
      );
      const filePath = path.join(
        projDir,
        fieldDirPath,
        'customMetadata',
        'Long_Flags_Create_Test.Long_Flags_Create_Test_Record.md-meta.xml'
      );
      const uxMessage = commandMessages.getMessage('successResponse', [
        'Long_Flags_Create_Test',
        'Long_Flags_Create_Test_Record',
        'Long Flags Create Test Record Label',
        'true',
        path.join('createWithLongFlags', 'customMetadata'),
      ]);

      expect(fs.existsSync(path.join(projDir, fieldDirPath))).to.be.true;
      expect(fs.existsSync(filePath)).to.be.true;
      expect(result.shellOutput.stdout).to.contain(uxMessage);
    });

    it('runs force:cmdt:record:create with short flags', () => {
      const fieldDirPath = 'shortFlagDir';
      const outputDir = path.join(fieldDirPath, 'Short_Flag_Test__mdt');

      const filePath = path.join(fieldDirPath, 'customMetadata', 'Short_Flag_Test.Short_Flag_Test_Record.md-meta.xml');

      execCmd(`force:cmdt:create --typename Long_Flags_Create_Test --outputdir ${fieldDirPath}`, {
        ensureExitCode: 0,
      });
      createOneOfEveryField(outputDir);
      execCmd(
        `force:cmdt:record:create -t Short_Flag_Test -n Short_Flag_Test_Record -l "Short Flag Test Record Label" -p true -i ${fieldDirPath} -d ${path.join(
          fieldDirPath,
          'customMetadata'
        )}`,
        { ensureExitCode: 0 }
      );
      expect(fs.existsSync(path.join(projDir, fieldDirPath))).to.be.true;
      expect(fs.existsSync(path.join(projDir, filePath))).to.be.true;
    });

    it('runs force:cmdt:record:create and accepts a typename with a __mdt suffix, but removes that suffix during record creation', () => {
      const fieldDirPath = 'suffixTestDir';
      const filePath = path.join('suffixTestDir', 'customMetadata', 'Suffix_Test.Suffix_Test_Record.md-meta.xml');
      execCmd(`force:cmdt:create --typename Suffix_Test --outputdir ${fieldDirPath}`, { ensureExitCode: 0 });
      execCmd(
        `force:cmdt:field:create --fieldname Check --fieldtype Checkbox --outputdir ${path.join(
          'suffixTestDir',
          'Suffix_Test__mdt'
        )}`,
        { ensureExitCode: 0 }
      );
      execCmd(
        `force:cmdt:record:create -t Suffix_Test__mdt -n Suffix_Test_Record -l "Suffix Test Record Label" -p true -i suffixTestDir -d ${path.join(
          'suffixTestDir',
          'customMetadata'
        )}`,
        { ensureExitCode: 0 }
      );
      expect(fs.existsSync(path.join(projDir, fieldDirPath))).to.be.true;
      expect(fs.existsSync(path.join(projDir, filePath))).to.be.true;
    });
  });

  describe('sfdx force:cmdt:record:create test contents of record file created', () => {
    it('should create records without optional flags', async () => {
      const testDir = 'outputTestDir';
      const fieldDirPath = path.join(testDir, 'Output_Test__mdt', 'fields');
      const filePath = path.join(projDir, fieldDirPath, 'Check__c.field-meta.xml');
      const outputDir = path.join(testDir, 'Output_Test__mdt');
      execCmd(`force:cmdt:create --typename Output_Test --outputdir ${testDir}`, { ensureExitCode: 0 });
      execCmd(`force:cmdt:field:create --fieldname Check --fieldtype Checkbox --outputdir ${outputDir}`, {
        ensureExitCode: 0,
      });
      execCmd(
        `force:cmdt:record:create -t Output_Test -n Output_Test_Record -i ${testDir} -d ${path.join(
          testDir,
          'customMetadata'
        )}`,
        { ensureExitCode: 0 }
      );
      expect(fs.existsSync(path.join(projDir, fieldDirPath))).to.be.true;
      expect(fs.existsSync(filePath)).to.be.true;

      const xml = await fs.promises.readFile(filePath, { encoding: 'utf-8' });
      expect(xml.includes('<fullName>Check__c</fullName>')).to.be.true;
      expect(xml.includes('<fieldManageability>DeveloperControlled</fieldManageability>')).to.be.true;
      expect(xml.includes('<label>Check</label>')).to.be.true;
      expect(xml.includes('<type>Checkbox</type>')).to.be.true;
      expect(xml.includes('<defaultValue>false</defaultValue>')).to.be.true;
    });
    it('should create records without optional flags and field values', async () => {
      const testDir = 'outputTestDir';
      const fieldDirPath = path.join(testDir, 'Output_Test__mdt', 'fields');
      const filePath = path.join(projDir, fieldDirPath, 'Check__c.field-meta.xml');
      const recordFilePath = path.join(
        projDir,
        testDir,
        'customMetadata',
        'Output_Test.Output_Test_Record.md-meta.xml'
      );
      const outputDir = path.join(testDir, 'Output_Test__mdt');
      execCmd(`force:cmdt:create --typename Output_Test --outputdir ${testDir}`, { ensureExitCode: 0 });
      execCmd(`force:cmdt:field:create --fieldname Check --fieldtype Checkbox --outputdir ${outputDir}`, {
        ensureExitCode: 0,
      });
      execCmd(
        `force:cmdt:record:create -t Output_Test -n Output_Test_Record -i ${testDir} -d ${path.join(
          testDir,
          'customMetadata'
        )} Check__c=true`,
        { ensureExitCode: 0 }
      );
      expect(fs.existsSync(path.join(projDir, fieldDirPath))).to.be.true;
      expect(fs.existsSync(filePath)).to.be.true;

      const xml = await fs.promises.readFile(filePath, { encoding: 'utf-8' });
      expect(xml.includes('<fullName>Check__c</fullName>')).to.be.true;
      expect(xml.includes('<fieldManageability>DeveloperControlled</fieldManageability>')).to.be.true;
      expect(xml.includes('<label>Check</label>')).to.be.true;
      expect(xml.includes('<type>Checkbox</type>')).to.be.true;
      expect(xml.includes('<defaultValue>false</defaultValue>')).to.be.true;
      const recordXml = await fs.promises.readFile(recordFilePath, { encoding: 'utf-8' });
      expect(recordXml.includes('<label>Output_Test_Record</label>')).to.be.true;
      expect(recordXml.includes('<field>Check__c</field>')).to.be.true;
      expect(/<value.*?>true<\/value>/.test(recordXml)).to.be.true;
    });
  });
});
