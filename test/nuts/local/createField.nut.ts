/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as fs from 'fs';
import * as path from 'path';
import { expect } from 'chai';
import { TestSession, execCmd } from '@salesforce/cli-plugins-testkit';
import { Messages } from '@salesforce/core';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-custom-metadata', 'field');

let session: TestSession;
let projDir: string;

describe('sfdx force:cmdt:field:create', () => {
  before(async () => {
    session = await TestSession.create({
      project: {
        name: 'cmdtCreateField',
      },
      devhubAuthStrategy: 'NONE',
    });
    projDir = session.project?.dir ?? '';
  });

  after(async () => {
    await session.zip(undefined, 'artifacts');
    await session.clean();
  });

  describe('successes', () => {
    it('runs force:cmdt:field:create --fieldname myField --fieldtype Text', async () => {
      const cmdtName = 'myField';
      execCmd(`force:cmdt:field:create --fieldname ${cmdtName} --fieldtype Text`, { ensureExitCode: 0 });
      const fieldLocation = path.join(projDir, 'fields', `${cmdtName}__c.field-meta.xml`);
      expect(fs.existsSync(path.join(projDir, 'fields'))).to.be.true;
      expect(fs.existsSync(fieldLocation)).to.be.true;
      const xml = await fs.promises.readFile(fieldLocation, { encoding: 'utf-8' });
      expect(xml.includes('<fullName>myField__c</fullName>')).to.be.true;
      expect(xml.includes('<fieldManageability>DeveloperControlled</fieldManageability>')).to.be.true;
      expect(xml.includes('<label>myField</label>')).to.be.true;
      expect(xml.includes('<type>Text</type>')).to.be.true;
      expect(xml.includes('<unique>false</unique>')).to.be.true;
      expect(xml.includes('<length>100</length>')).to.be.true;
    });

    it('runs force:cmdt:field:create --fieldname myField --fieldtype Picklist --picklistvalues a,b,c', () => {
      const cmdtName = 'myField2';
      execCmd(
        `force:cmdt:field:create --fieldname ${cmdtName} --fieldtype Picklist --picklistvalues a,b,c -d picklistField`,
        { ensureExitCode: 0 }
      );

      expect(fs.existsSync(path.join(projDir, 'picklistField', 'fields'))).to.be.true;
      expect(fs.existsSync(path.join(projDir, 'picklistField', 'fields', `${cmdtName}__c.field-meta.xml`))).to.be.true;
    });
  });

  describe('failures', () => {
    it('fails running force:cmdt:field:create --fieldname myFi__eld --fieldtype Text', () => {
      const result = execCmd('force:cmdt:field:create --fieldname myFi__eld --fieldtype Text', { ensureExitCode: 1 });
      expect(result.shellOutput.stderr).to.contain(messages.getMessage('invalidCustomFieldError', ['myFi__eld']));
    });

    it('fails running force:cmdt:field:create --fieldname myField --fieldtype Picklist', () => {
      const result = execCmd('force:cmdt:field:create --fieldname myField --fieldtype Picklist', {
        ensureExitCode: 1,
      });
      expect(result.shellOutput.stderr).to.contain('Picklist values are required when field type is Picklist');
    });

    it('fails running force:cmdt:field:create --fieldname money --fieldtype Currency', () => {
      const result = execCmd('force:cmdt:field:create --fieldname money --fieldtype Currency', {
        ensureExitCode: 1,
      });
      expect(result.shellOutput.stderr).to.contain(
        'Expected --type=Currency to be one of: Checkbox, Date, DateTime, Email, Number, Percent, Phone, Picklist, Text, TextArea, LongTextArea, Url'
      );
    });
  });
});
