/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { strict as assert } from 'node:assert';
import { expect } from 'chai';
import {
  createFieldXML,
  createObjectXML,
  canConvert,
  createDefaultTypeStructure,
} from '../../src/shared/templates/templates.js';

describe('Templates', () => {
  describe('createObjectXML', () => {
    const testData = {
      label: 'Sample',
      pluralLabel: 'Samples',
    };
    const xml: string = createObjectXML(testData, 'Public');
    expect(xml).to.include('<label>Sample</label>');
    expect(xml).to.include('<pluralLabel>Samples</pluralLabel>');
    expect(xml).to.include('<visibility>Public</visibility>');
  });

  describe('createFieldXML', () => {
    it('Checkbox field created', () => {
      const data: any = { fullName: 'Checkbox', defaultValue: 'false', type: 'Checkbox', label: 'test' };
      const xml: string = createFieldXML(data, false);
      expect(xml).to.include('<fullName>Checkbox__c</fullName>');
      expect(xml).to.include('<type>Checkbox</type>');
      expect(xml).to.include('<label>test</label>');
    });
    it('Date field created', () => {
      const data: any = { fullName: 'Date', type: 'Date', label: 'test' };
      const xml: string = createFieldXML(data, false);
      expect(xml).to.include('<fullName>Date__c</fullName>');
      expect(xml).to.include('<type>Date</type>');
      expect(xml).to.include('<label>test</label>');
    });
    it('DateTime field created', () => {
      const data: any = { fullName: 'DateTime', type: 'DateTime', label: 'test' };
      const xml: string = createFieldXML(data, false);
      expect(xml).to.include('<fullName>DateTime__c</fullName>');
      expect(xml).to.include('<type>DateTime</type>');
      expect(xml).to.include('<label>test</label>');
    });
    it('Email field created', () => {
      const data: any = { fullName: 'Email', type: 'Email', label: 'test', unique: false };
      const xml: string = createFieldXML(data, false);
      expect(xml).to.include('<fullName>Email__c</fullName>');
      expect(xml).to.include('<type>Email</type>');
      expect(xml).to.include('<label>test</label>');
      expect(xml).to.include('<unique>false</unique>');
    });
    it('Number field created', () => {
      const data: any = {
        fullName: 'Number',
        type: 'Number',
        externalId: 'true',
        label: 'test',
        precision: '18',
        scale: '0',
        unique: false,
      };
      const xml: string = createFieldXML(data, false);
      expect(xml).to.include('<fullName>Number__c</fullName>');
      expect(xml).to.include('<type>Number</type>');
      expect(xml).to.include('<label>test</label>');
      expect(xml).to.include('<unique>false</unique>');
      expect(xml).to.include('<precision>18</precision>');
      expect(xml).to.include('<scale>0</scale>');
      expect(xml).to.include('<externalId>true</externalId>');
    });
    it('Percent field created', () => {
      const data: any = { fullName: 'Percent', type: 'Percent', label: 'test', precision: '18', scale: '0' };
      const xml: string = createFieldXML(data, false);
      expect(xml).to.include('<fullName>Percent__c</fullName>');
      expect(xml).to.include('<type>Percent</type>');
      expect(xml).to.include('<label>test</label>');
      expect(xml).to.include('<precision>18</precision>');
      expect(xml).to.include('<scale>0</scale>');
    });
    it('Phone field created', () => {
      const data: any = { fullName: 'Phone', type: 'Phone', label: 'test' };
      const xml: string = createFieldXML(data, false);
      expect(xml).to.include('<fullName>Phone__c</fullName>');
      expect(xml).to.include('<type>Phone</type>');
      expect(xml).to.include('<label>test</label>');
    });
    it('Picklist field created', () => {
      const data: any = {
        fullName: 'Picklist',
        type: 'Picklist',
        label: 'test',
        valueSet: {
          restricted: 'true',
          valueSetDefinition: {
            sorted: 'false',
            value: [
              { fullName: 'value', label: 'value' },
              { fullName: 'value2', label: 'value2' },
            ],
          },
        },
      };
      const xml: string = createFieldXML(data, false);
      expect(xml).to.include('<fullName>Picklist__c</fullName>');
      expect(xml).to.include('<type>Picklist</type>');
      expect(xml).to.include('<label>test</label>');
      expect(xml).to.include('<fullName>value</fullName>');
      expect(xml).to.include('<fullName>value2</fullName>');
      expect(xml).to.include('<label>value</label>');
      expect(xml).to.include('<label>value2</label>');
    });
    it('should not add value sets for a MultiselectPicklist field', () => {
      const data: any = {
        fullName: 'Picklist',
        type: 'MultiselectPicklist',
        label: 'test',
        valueSet: {
          restricted: 'true',
          valueSetDefinition: {
            sorted: 'false',
            value: [
              { fullName: 'value', label: 'value' },
              { fullName: 'value2', label: 'value2' },
            ],
          },
        },
      };
      const xml = createFieldXML(data, true);
      expect(xml).to.include('<fullName>Picklist__c</fullName>');
      expect(xml).to.include('<type>LongTextArea</type>');
      expect(xml).to.include('<label>test</label>');
      expect(xml).to.not.include('<fullName>value</fullName>');
      expect(xml).to.not.include('<fullName>value2</fullName>');
      expect(xml).to.not.include('<label>value</label>');
      expect(xml).to.not.include('<label>value2</label>');
    });
    it('Text field created', () => {
      const data: any = { fullName: 'Text', type: 'Text', label: 'test', unique: false, length: '100' };
      const xml = createFieldXML(data, false);
      expect(xml);
      expect(xml).to.include('<fullName>Text__c</fullName>');
      expect(xml).to.include('<type>Text</type>');
      expect(xml).to.include('<label>test</label>');
      expect(xml).to.include('<unique>false</unique>');
      expect(xml).to.include('<length>100</length>');
    });
    it('default to Text field', () => {
      const data: any = { fullName: 'Text', type: 'Lookup', label: 'test', unique: false, length: '100' };
      const xml = createFieldXML(data, true);
      expect(xml).to.include('<fullName>Text__c</fullName>');
      expect(xml).to.include('<type>Text</type>');
      expect(xml).to.include('<label>test</label>');
      expect(xml).to.include('<unique>false</unique>');
      expect(xml).to.include('<length>100</length>');
    });
    it('TextArea field created', () => {
      const data: any = { fullName: 'TextArea', type: 'TextArea', label: 'test', unique: false, length: '100' };
      const xml = createFieldXML(data, false);
      expect(xml).to.include('<fullName>TextArea__c</fullName>');
      expect(xml).to.include('<type>TextArea</type>');
      expect(xml).to.include('<label>test</label>');
      expect(xml).to.include('<unique>false</unique>');
      expect(xml).to.include('<length>100</length>');
    });
    it('LongTextArea field created', () => {
      const data: any = {
        fullName: 'LongTextArea',
        type: 'LongTextArea',
        label: 'test',
        length: '32768',
        visibleLines: 3,
      };
      const xml: string = createFieldXML(data, false);
      expect(xml).to.include('<fullName>LongTextArea__c</fullName>');
      expect(xml).to.include('<type>LongTextArea</type>');
      expect(xml).to.include('<label>test</label>');
      expect(xml).to.include('<length>32768</length>');
      expect(xml).to.include('<visibleLines>3</visibleLines>');
    });
    it('default to LongTextArea field', () => {
      const data: any = { fullName: 'LongTextArea', type: 'Html', label: 'test', length: '32768', visibleLines: 3 };
      const xml = createFieldXML(data, true);
      expect(xml).to.include('<fullName>LongTextArea__c</fullName>');
      expect(xml).to.include('<type>LongTextArea</type>');
      expect(xml).to.include('<label>test</label>');
      expect(xml).to.include('<length>32768</length>');
      expect(xml).to.include('<visibleLines>3</visibleLines>');
    });

    it('Url field created', () => {
      const data: any = { fullName: 'Url', type: 'Url', label: 'test' };
      const xml = createFieldXML(data, false);
      expect(xml).to.include('<fullName>Url__c</fullName>');
      expect(xml).to.include('<type>Url</type>');
      expect(xml).to.include('<label>test</label>');
    });
    it('default to LongTextArea field', () => {
      const data: any = { fullName: 'LongTextArea', type: 'Html', label: 'test', length: '32768', visibleLines: 3 };
      try {
        createFieldXML(data, false);
      } catch (ex) {
        assert(ex instanceof Error);
        expect(ex.message).to.contain("'Html' is not a valid field type.");
      }
    });
    it('default to Text field for Currency field', () => {
      const data: any = {
        fullName: 'Currency',
        type: 'Currency',
        label: 'test',
        precision: '18',
        scale: '0',
        unique: false,
        defaultValue: '1000',
      };
      const xml: string = createFieldXML(data, true);
      expect(xml).to.include('<fullName>Currency__c</fullName>');
      expect(xml).to.include('<type>Text</type>');
      expect(xml).to.include('<label>test</label>');
      expect(xml).to.include('<unique>false</unique>');
      expect(xml).to.include('<length>100</length>');
      expect(xml).to.include("<defaultValue>'1000'</defaultValue>");
    });
    it('should convert Formula fields to long text area type', () => {
      const data: any = {
        fullName: 'FormulaText',
        type: 'Text',
        label: 'test',
        externalId: 'false',
        unique: false,
        inlineHelpText: 'Formula text field',
      };
      const xml: string = createFieldXML(data, true);
      expect(xml).to.include('<fullName>FormulaText__c</fullName>');
      expect(xml).to.include('<type>LongTextArea</type>');
      expect(xml).to.include('<label>test</label>');
      expect(xml).to.include('<length>32768</length>');
    });
    it('Formula Checkbox field created', () => {
      const data: any = { fullName: 'FormulaCheckbox', type: 'Checkbox', label: 'test' };
      const xml: string = createFieldXML(data, false);
      expect(xml).to.include('<fullName>FormulaCheckbox__c</fullName>');
      expect(xml).to.include('<type>Checkbox</type>');
      expect(xml).to.include('<label>test</label>');
      expect(xml).to.include('<defaultValue>false</defaultValue>');
      expect(xml.includes('<inlineHelpText>Formula text field</inlineHelpText>')).to.be.false;
    });
  });
  describe('createDefaultTypeStructure', () => {
    let struct: any;
    it('should return Checkbox structure', () => {
      struct = createDefaultTypeStructure('Checkbox', 'Checkbox', 'test');
      expect(struct.fullName).to.equal('Checkbox');
      expect(struct.type).to.equal('Checkbox');
      expect(struct.label).to.equal('test');
      expect(struct.defaultValue).to.equal('false');
    });
    it('should return Date structure', () => {
      struct = createDefaultTypeStructure('Date', 'Date', 'test');
      expect(struct.fullName).to.equal('Date');
      expect(struct.type).to.equal('Date');
      expect(struct.label).to.equal('test');
    });
    it('should return DateTime structure', () => {
      struct = createDefaultTypeStructure('DateTime', 'DateTime', 'test');
      expect(struct.fullName).to.equal('DateTime');
      expect(struct.type).to.equal('DateTime');
      expect(struct.label).to.equal('test');
    });
    it('should return Email structure', () => {
      struct = createDefaultTypeStructure('Email', 'Email', 'test');
      expect(struct.fullName).to.equal('Email');
      expect(struct.type).to.equal('Email');
      expect(struct.label).to.equal('test');
      expect(struct.unique).to.equal(false);
    });
    it('should return Number structure', () => {
      struct = createDefaultTypeStructure('Number', 'Number', 'test');
      expect(struct.fullName).to.equal('Number');
      expect(struct.type).to.equal('Number');
      expect(struct.label).to.equal('test');
      expect(struct.precision).to.equal(18);
      expect(struct.scale).to.equal(0);
      expect(struct.unique).to.equal(false);
    });
    it('should return Percent structure', () => {
      struct = createDefaultTypeStructure('Percent', 'Percent', 'test');
      expect(struct.fullName).to.equal('Percent');
      expect(struct.type).to.equal('Percent');
      expect(struct.label).to.equal('test');
      expect(struct.precision).to.equal(18);
      expect(struct.scale).to.equal(0);
    });
    it('should return Phone structure', () => {
      struct = createDefaultTypeStructure('Phone', 'Phone', 'test');
      expect(struct.fullName).to.equal('Phone');
      expect(struct.type).to.equal('Phone');
      expect(struct.label).to.equal('test');
    });
    it('should return Picklist structure', () => {
      struct = createDefaultTypeStructure('Picklist', 'Picklist', 'test', ['value1', 'value2']);
      expect(struct.fullName).to.equal('Picklist');
      expect(struct.type).to.equal('Picklist');
      expect(struct.label).to.equal('test');
      expect(struct.valueSet.restricted).to.equal(true);
      expect(struct.valueSet.valueSetDefinition.sorted === 'false').to.equal(false);
      expect(struct.valueSet.valueSetDefinition.value[0].label).to.equal('value1');
    });
    it('should return Phone structure', () => {
      struct = createDefaultTypeStructure('Phone', 'Phone', 'test');
      expect(struct.fullName).to.equal('Phone');
      expect(struct.type).to.equal('Phone');
      expect(struct.label).to.equal('test');
    });
    it('should return Text structure', () => {
      struct = createDefaultTypeStructure('Text', 'Text', 'test');
      expect(struct.fullName).to.equal('Text');
      expect(struct.type).to.equal('Text');
      expect(struct.label).to.equal('test');
      expect(struct.unique).to.equal(false);
      expect(struct.length).to.equal(100);
    });
    it('should return TextArea structure', () => {
      struct = createDefaultTypeStructure('TextArea', 'TextArea', 'test');
      expect(struct.fullName).to.equal('TextArea');
      expect(struct.type).to.equal('TextArea');
      expect(struct.label).to.equal('test');
    });
    it('should return LongTextArea structure', () => {
      struct = createDefaultTypeStructure('LongTextArea', 'LongTextArea', 'test');
      expect(struct.fullName).to.equal('LongTextArea');
      expect(struct.type).to.equal('LongTextArea');
      expect(struct.label).to.equal('test');
      expect(struct.length).to.equal(32768);
      expect(struct.visibleLines).to.equal(3);
    });
    it('should return Url structure', () => {
      struct = createDefaultTypeStructure('Url', 'Url', 'test');
      expect(struct.fullName).to.equal('Url');
      expect(struct.type).to.equal('Url');
      expect(struct.label).to.equal('test');
    });
    it('should return Default structure', () => {
      struct = createDefaultTypeStructure('DefaultA', 'DefaultB', 'DefaultC');
      expect(struct.fullName).to.equal('DefaultA');
      expect(struct.type).to.equal('DefaultB');
      expect(struct.label).to.equal('DefaultC');
    });
  });
  describe('canConvert', () => {
    it('type should convert', () => {
      [
        'Checkbox',
        'Date',
        'DateTime',
        'Email',
        'Number',
        'Percent',
        'Phone',
        'Picklist',
        'Text',
        'TextArea',
        'LongTextArea',
        'Url',
      ].forEach((type) => {
        expect(canConvert(type)).to.be.true;
      });
    });
    it('type should not convert', () => {
      expect(canConvert('test')).to.be.false;
    });
  });
});
