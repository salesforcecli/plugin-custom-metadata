/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { CustomObject, CustomField } from 'jsforce/api/metadata';
import type { Record } from 'jsforce';
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
