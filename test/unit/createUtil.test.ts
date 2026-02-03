/*
 * Copyright 2026, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint-disable camelcase */

import { expect } from 'chai';
import type { CustomField } from '@jsforce/jsforce-node/lib/api/metadata.js';
import { appendDirectorySuffix, buildCustomFieldXml } from '../../src/shared/helpers/createUtil.js';

describe('CreateUtil', () => {
  describe('appendDirectorySuffix', () => {
    it('should append a suffix of __mdt if id does not already exist', async () => {
      const output1 = appendDirectorySuffix('foo');
      const output2 = appendDirectorySuffix('foobar__mdt');

      expect(output1 === 'foo__mdt').to.be.true;
      expect(output2 === 'foobar__mdt').to.be.true;
    });
  });

  describe('buildCustomFieldXml', () => {
    const fields = [
      {
        fullName: 'Test__c',
        label: 'Test',
        type: 'Text',
      },
      {
        fullName: 'Test2__c',
        label: 'Test2',
        type: 'Checkbox',
      },
    ] as CustomField[];

    it('2 fields that are convertible become records', () => {
      const xml = buildCustomFieldXml(fields, { Test__c: 'foo', Test2__c: 'true' });
      expect(xml).to.equal(`
    <values>
        <field>Test__c</field>
        <value xsi:type="xsd:string">foo</value>
    </values>
    <values>
        <field>Test2__c</field>
        <value xsi:type="xsd:boolean">true</value>
    </values>`);
    });
    it('undefined values do not become records', () => {
      const xml = buildCustomFieldXml(fields, { Test__c: 'foo' });

      expect(xml).to.equal(`
    <values>
        <field>Test__c</field>
        <value xsi:type="xsd:string">foo</value>
    </values>`);
    });
    describe('non-convertible fields', () => {
      const fieldsWithLookup = [
        ...fields,
        {
          fullName: 'Test3__c',
          label: 'Test3',
          type: 'Lookup',
        } as CustomField,
      ];

      it('2 fields that are convertible with a non-convertible one when ignoreFields=true', () => {
        const xml = buildCustomFieldXml(fieldsWithLookup, { Test__c: 'foo', Test3__c: 'badValue' }, true);
        // that 2nd one is omitted because it has no value
        expect(xml).to.equal(`
    <values>
        <field>Test__c</field>
        <value xsi:type="xsd:string">foo</value>
    </values>`);
      });
      it('2 fields that are convertible with a non-convertible one and ignoreFields=false', () => {
        const xml = buildCustomFieldXml(fieldsWithLookup, { Test__c: 'foo', Test3__c: 'badValue' }, false);
        expect(xml).to.equal(`
    <values>
        <field>Test__c</field>
        <value xsi:type="xsd:string">foo</value>
    </values>
    <values>
        <field>Test3__c</field>
        <value xsi:type="xsd:string">badValue</value>
    </values>`);
      });
    });
  });
});
