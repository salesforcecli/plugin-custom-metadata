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

import { deepStrictEqual } from 'node:assert';
import type { CustomObject } from '@jsforce/jsforce-node/lib/api/metadata.js';
import {
  cleanQueryResponse,
  describeField,
  validCustomSettingType,
  describeObjFields,
} from '../../src/shared/helpers/metadataUtil.js';

describe('metadataUtil', () => {
  const readResponse: CustomObject = {
    actionOverrides: [],
    businessProcesses: [],
    compactLayouts: [],
    fullName: 'TriggerSettings__c',
    customSettingsType: 'List',
    description: 'Used to declaratively enable/disable custom triggers.',
    enableFeeds: false,
    fieldSets: [],
    fields: [
      {
        fullName: 'IsAfterDeleteDisabled__c',
        defaultValue: 'false',
        externalId: false,
        label: 'After Delete Disabled?',
        trackTrending: false,
        type: 'Checkbox',
        summaryFilterItems: [],
      },
      {
        fullName: 'IsDisabled__c',
        defaultValue: 'false',
        externalId: false,
        inlineHelpText: 'Check this to disable the trigger',
        label: 'Disabled?',
        trackTrending: false,
        type: 'Checkbox',
        summaryFilterItems: [],
      },
    ],
    indexes: [],
    label: 'Trigger Settings',
    listViews: [],
    recordTypes: [],
    sharingReasons: [],
    sharingRecalculations: [],
    validationRules: [],
    visibility: 'Public',
    webLinks: [],
    profileSearchLayouts: [],
  };

  describe('queryRecords', () => {
    it('should get records in response', () => {
      const objDescribeWithGeoField = {
        ...readResponse,
        fields: [
          ...readResponse.fields,
          {
            fullName: 'Test_Geo_location__c',
            displayLocationInDecimal: 'true',
            externalId: false,
            label: 'Test Geo location',
            required: false,
            scale: 10,
            trackHistory: false,
            trackTrending: false,
            type: 'Location',
            summaryFilterItems: [],
          },
        ],
      };

      const queryResponse = {
        totalSize: 2,
        done: true,
        records: [
          {
            IsAfterDeleteDisabled__c: true,
            IsDisabled__c: false,
            Test_Geo_location__c: { latitude: 12.345_345_34, longitude: 32.345_345_43 },
          },
          { IsAfterDeleteDisabled__c: true, IsDisabled__c: false, Test_Geo_location__c: null },
        ],
      };
      const cleanResponse1 = {
        IsAfterDeleteDisabled__c: true,
        IsDisabled__c: false,
        Lat_Test_Geo_location__c: '12.34534534',
        Long_Test_Geo_location__c: '32.34534543',
      };
      const cleanResponse2 = {
        IsAfterDeleteDisabled__c: true,
        IsDisabled__c: false,
        Lat_Test_Geo_location__c: '',
        Long_Test_Geo_location__c: '',
      };

      const cleanQueryResponse1 = cleanQueryResponse(queryResponse['records'][0], objDescribeWithGeoField);
      const cleanQueryResponse2 = cleanQueryResponse(queryResponse['records'][1], objDescribeWithGeoField);
      deepStrictEqual(cleanResponse1, cleanQueryResponse1);
      deepStrictEqual(cleanResponse2, cleanQueryResponse2);
    });
  });

  describe('describeObjFields', () => {
    it('should get fields describe in response', () => {
      const fieldsDescribe = describeObjFields(readResponse);
      deepStrictEqual(readResponse.fields, fieldsDescribe);
    });
  });

  describe('describeField', () => {
    it('should get field describe in response', () => {
      const fieldDescribe = describeField(readResponse, 'IsDisabled__c');
      deepStrictEqual(fieldDescribe?.fullName, 'IsDisabled__c');
    });
  });

  describe('validCustomSettingType', () => {
    it('should check the custom setting type and visibility', () => {
      const isValidCustomSetting = validCustomSettingType(readResponse);
      deepStrictEqual(isValidCustomSetting, true);
    });

    it('should fail check for the custom setting type and visibility', () => {
      const isValidCustomSetting = validCustomSettingType({ ...readResponse, visibility: 'Protected' });
      deepStrictEqual(isValidCustomSetting, false);
    });
  });
});
