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

import type { CustomObject, CustomField } from '@jsforce/jsforce-node/lib/api/metadata.js';
import type { Record } from '@jsforce/jsforce-node';
/**
 * Returns describe object for the field API name from the Object API name you specify
 *
 * @param  objDescribe  describe object JSON
 * @param  fieldName API name of the field to query
 * @returns Promise - Promise - record in JSON format
 */
export const describeField = (objDescribe: CustomObject, fieldName: string): CustomField | undefined =>
  describeObjFields(objDescribe).find((field) => field.fullName === fieldName);

/**
 * Returns true if the object name you specify is a list type custom setting
 *
 * @param  objName object describe JSON
 * @returns boolean
 */
export const validCustomSettingType = (objDescribe: CustomObject): boolean =>
  objDescribe.customSettingsType === 'List' && objDescribe.visibility === 'Public';

/**
 * Returns describe object for all fields from the object  API name you specify
 *
 * @param  objDescribe object describe JSON
 * @returns Promise - Promise - record in JSON format
 */
export const describeObjFields = (objDescribe: CustomObject): CustomField[] => objDescribe.fields;

export const cleanQueryResponse = (sObjectRecord: Record, objectDescribe: CustomObject): Record =>
  Object.fromEntries(
    Object.entries(sObjectRecord)
      .filter(([fieldName]) => fieldName !== 'attributes' && fieldName !== 'Name')
      .flatMap(([fieldName, value]) => {
        const fieldDescribe = describeField(objectDescribe, fieldName);
        // everything but location returns as is
        if (fieldDescribe?.type !== 'Location') {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return [[fieldName, value]];
        }
        const fieldValue = JSON.stringify(value);
        if (fieldValue.includes('latitude') || fieldValue.includes('longitude')) {
          return [
            [`Lat_${fieldName}`, fieldValue.slice(fieldValue.indexOf(':') + 1, fieldValue.indexOf(','))],
            [`Long_${fieldName}`, fieldValue.slice(fieldValue.lastIndexOf(':') + 1, fieldValue.indexOf('}'))],
          ];
        } else {
          return [
            [`Lat_${fieldName}`, ''],
            [`Long_${fieldName}`, ''],
          ];
        }
      })
  );
