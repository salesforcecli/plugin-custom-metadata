/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { SfError, Messages } from '@salesforce/core';
Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('@salesforce/plugin-custom-metadata', 'validation', [
  'sobjectnameFlagError',
  'invalidCMDTApiName',
  'notAValidRecordNameError',
]);

/**
 * Returns true if the name is a valid api name for an sobject/field
 *
 * @param  name API name of the object
 */
export const validateAPIName = (name: string, message?: string): string => {
  // trimming the __c from the field during character count since it does not count towards the limit
  // Regex makes sure that the field name is alpha numeric, doesn't end in an underscore
  // and optionally if it ends in __c
  const cleanedValue = name.replace('__c', '').replace('__C', '');
  if (cleanedValue.length > 40 || !/^[a-zA-Z][a-zA-Z0-9]*(_[a-zA-Z0-9]+)*(__[cC])?$/.test(cleanedValue)) {
    throw new SfError(message ?? messages.getMessage('sobjectnameFlagError', [name]));
  }
  return name;
};

/**
 * Returns true if the fieldname is a valid metadata object name
 *
 * @param  fieldName API name of the field
 */
export const validateMetadataTypeName = (typeName: string): string => {
  // trimming the __mdt from the field during character count since it does not count towards the limit
  // Regex makes sure that the field name is alpha numeric, doesn't end in an underscore
  // and optionally if it ends in __mdt
  const trimmedValue = typeName.replace(/__mdt$/gi, '');
  if (trimmedValue.length > 40 || !/^[a-zA-Z][a-zA-Z0-9]*(_[a-zA-Z0-9]+)*(__[mdtT])?$/.test(trimmedValue)) {
    throw new SfError(messages.getMessage('invalidCMDTApiName', [typeName]));
  }
  return trimmedValue;
};

export const isValidMetadataRecordName = (recordName: string): boolean =>
  recordName.length <= 40 && /^[a-zA-Z][a-zA-Z0-9]*(_[a-zA-Z0-9]+)*$/.test(recordName);
/**
 * Returns true if the fieldname is a valid metadata record name
 *
 * @param  fieldName record name of a metadata record
 */
export const validateMetadataRecordName = (typeName: string): string => {
  // Regex makes sure that the field name is alpha numeric, doesn't end in an underscore
  if (!isValidMetadataRecordName(typeName)) {
    throw new SfError(messages.getMessage('notAValidRecordNameError', [typeName]));
  }
  return typeName;
};

/**
 * Returns true if name is below 40 characters
 *
 * @param  name label name or plural label
 */
export const validateLessThanForty = (name: string, message: string): string => {
  if (name.length > 40) {
    throw new SfError(message);
  }
  return name;
};
