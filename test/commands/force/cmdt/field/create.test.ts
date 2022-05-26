/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as fs from 'fs';

import { expect, test } from '@salesforce/command/lib/test';
import { Messages } from '@salesforce/core';
Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-custom-metadata', 'createField');

describe('sfdx force:cmdt:field:create', () => {
  test
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .command(['force:cmdt:field:create', '--fieldname', 'myField', '--fieldtype', 'Text'])
    .it('runs force:cmdt:field:create --fieldname myField --fieldtype Text', (ctx) => {
      const cmdtName = 'myField';
      expect(fs.existsSync('fields')).to.be.true;
      expect(fs.existsSync(`fields/${cmdtName}__c.field-meta.xml`)).to.be.true;
      fs.readFile(`fields/${cmdtName}__c.field-meta.xml`, { encoding: 'utf-8' }, function (err, xml) {
        expect(xml.includes('<fullName>myField__c</fullName>')).to.be.true;
        expect(xml.includes('<fieldManageability>DeveloperControlled</fieldManageability>')).to.be.true;
        expect(xml.includes('<label>myField</label>')).to.be.true;
        expect(xml.includes('<type>Text</type>')).to.be.true;
        expect(xml.includes('<unique>false</unique>')).to.be.true;
        expect(xml.includes('<length>100</length>')).to.be.true;
      });
      fs.rmSync('fields', { recursive: true });
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stderr()
    .command(['force:cmdt:field:create', '--fieldname', 'myFi__eld', '--fieldtype', 'Text'])
    .it('fails running force:cmdt:field:create --fieldname myFi__eld --fieldtype Text', (ctx) => {
      expect(ctx.stderr).to.contain(messages.getMessage('invalidCustomFieldError', ['myFi__eld']));
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stderr()
    .command(['force:cmdt:field:create', '--fieldname', 'myField', '--fieldtype', 'Picklist'])
    .it('fails running force:cmdt:field:create --fieldname myField --fieldtype Picklist', (ctx) => {
      expect(ctx.stderr).to.contain('Picklist values are required when field type is Picklist');
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stdout()
    .command([
      'force:cmdt:field:create',
      '--fieldname',
      'myField',
      '--fieldtype',
      'Picklist',
      '--picklistvalues',
      'a,b,c',
      '-d',
      'picklistField',
    ])
    .it('runs force:cmdt:field:create --fieldname myField --fieldtype Picklist --picklistvalues a,b,c', (ctx) => {
      const cmdtName = 'myField';
      expect(fs.existsSync('picklistField/fields')).to.be.true;
      expect(fs.existsSync(`picklistField/fields/${cmdtName}__c.field-meta.xml`)).to.be.true;
      fs.rmSync('picklistField', { recursive: true });
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stderr()
    .command(['force:cmdt:field:create', '--fieldname', 'money', '--fieldtype', 'Currency'])
    .it('fails running force:cmdt:field:create --fieldname money --fieldtype Currency', (ctx) => {
      expect(ctx.stderr).to.contain(
        'Expected --fieldtype=Currency to be one of: Checkbox, Date, DateTime, Email, Number, Percent, Phone, Picklist, Text, TextArea, LongTextArea, Url'
      );
    });

  test
    .withOrg({ username: 'test@org.com' }, true)
    .stderr()
    .command(['force:cmdt:field:create', '--fieldname', 'myField', '--fieldtype', 'Number', '--decimalplaces', '-2'])
    .it('fails running force:cmdt:field:create --fieldname myField --fieldtype Number --decimalplaces -2', (ctx) => {
      // default message from the flag's `min` param
      expect(ctx.stderr).to.contain('Expected number greater than or equal to 0 but received -2');
    });
});
