/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/* eslint-disable class-methods-use-this */

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SfError, Messages } from '@salesforce/core';

Messages.importMessagesDirectory(dirname(fileURLToPath(import.meta.url)));
const messages = Messages.loadMessages('@salesforce/plugin-custom-metadata', 'template');
import { CustomValue, CustomField } from 'jsforce/api/metadata';

/**
 * Using the given data and visibility, creates the body of a type metadata file
 *
 * @param data
 * @param visibility
 */
export const createObjectXML = (
  { label, pluralLabel }: { label: string; pluralLabel: string },
  visibility: string
): string => {
  let returnValue = '<?xml version="1.0" encoding="UTF-8"?>\n';
  returnValue += '<CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">\n';
  returnValue += `\t<label>${label}</label>\n`;
  returnValue += `\t<pluralLabel>${pluralLabel}</pluralLabel>\n`;
  returnValue += `\t<visibility>${visibility}</visibility>\n`;
  returnValue += '</CustomObject>\n';
  return returnValue;
};

/**
 * Using the given data and defaultToString, creates the body for a field file.
 *
 * @param data Record details
 * @param defaultToString If the defaultToString set type to Text for unsupported field types
 */
export const createFieldXML = (data: CustomField, defaultToString: boolean): string => {
  let returnValue = '<?xml version="1.0" encoding="UTF-8"?>\n';
  returnValue += '<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">\n';
  returnValue += getFullName(data);
  returnValue += getDescription(data);
  returnValue += getExternalId(data);
  returnValue += getFieldManageability(data);
  returnValue += getInlineHelpText(data);
  returnValue += getLabel(data);
  returnValue += getType(data, defaultToString);
  returnValue += getDefaultValue(data);
  returnValue += getRequiredTag(data);
  returnValue += getLengthTag(data);
  returnValue += getVisibleLines(data);

  // preventing standard objects that have fields that are being converted from passing in data
  // that is no longer relevant
  // e.g. multiselectpicklist are being converted to long text area and long text area's do not support valuesets
  if (canConvert(data.type)) {
    returnValue += getValueSet(data);
    returnValue += getPrecisionTag(data);
    returnValue += getScaleTag(data);
  }

  returnValue += '</CustomField>\n';
  return returnValue;
};

export const createDefaultTypeStructure = (
  fullName: string,
  type: string,
  label: string,
  picklistValues: string[] = [],
  decimalplaces = 0
): CustomField => {
  const precision = 18 - decimalplaces;
  const scale = decimalplaces;
  const baseObject = { fullName, type, label, summaryFilterItems: [] };
  switch (type) {
    case 'Checkbox':
      return { ...baseObject, defaultValue: 'false' };
    case 'Email':
      return { ...baseObject, unique: false };
    case 'Number':
      return { ...baseObject, precision, scale, unique: false };
    case 'Percent':
      return { ...baseObject, precision, scale };
    case 'Picklist':
      return {
        ...baseObject,
        valueSet: {
          restricted: true,
          valueSetDefinition: {
            sorted: false,
            value: createPicklistValues(picklistValues),
          },
          valueSettings: [],
        },
      };
    case 'Text':
      return { ...baseObject, unique: false, length: 100 };
    case 'LongTextArea':
      return { ...baseObject, length: 32768, visibleLines: 3 };
    case 'Date':
    case 'DateTime':
    case 'Phone':
    case 'TextArea':
    case 'Url':
      return baseObject;
    default:
      return baseObject;
  }
};

export const canConvert = (type: string | undefined | null): boolean => {
  const metadataFieldTypes = [
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
  ];
  return typeof type === 'string' && metadataFieldTypes.includes(type);
};

const createPicklistValues = (values: string[]): CustomValue[] =>
  values.map((value) => ({ fullName: value, label: value, default: false }));

const getType = (data: CustomField, defaultToMetadataType: boolean): string => {
  if (canConvert(data.type)) {
    // To handle the text formula field scenario where field type will be Text with no length attribute
    if (data.type === 'Text' && data.length === undefined) {
      return '\t<type>LongTextArea</type>\n';
    }
    return `\t<type>${data.type}</type>\n`;
  } else if (defaultToMetadataType) {
    return `\t<type>${getConvertType(data)}</type>\n`;
  } else {
    throw new SfError(messages.getMessage('errorNotAValidType', [data.type]));
  }
};

const getLengthTag = (data: CustomField): string => {
  // If field type is multiselect or
  // data type is text with no length attribute then it is formula field then set the length to 32768 as we are setting the type LongTextArea
  if (data.type === 'MultiselectPicklist' || (data.type === 'Text' && data.length === undefined)) {
    return '\t<length>32768</length>\n';
  }

  if (data.length) {
    return `\t<length>${data.length}</length>\n`;
  }
  // For fields that are being translated from Custom objects that do not have a matching type they are
  // being defaulted to a Text field. They need to have a minimum length to them
  // e.g. Field types that are getting converted: Currency, Location, MasterDetail, Lookup
  return !canConvert(data.type) && getConvertType(data) === 'Text' ? '\t<length>100</length>\n' : '';
};

const getVisibleLines = (data: CustomField): string => {
  if (data.type === 'Text' && data.length === undefined) {
    return '\t<visibleLines>3</visibleLines>\n';
  }
  return data.visibleLines ? `\t<visibleLines>${data.visibleLines}</visibleLines>\n` : '';
};

const getDefaultValue = (data: CustomField): string => {
  if (data.type === 'Currency') {
    return data.defaultValue ? `\t<defaultValue>'${data.defaultValue}'</defaultValue>\n` : '';
  } else if (data.type === 'Checkbox' && data.defaultValue === undefined) {
    return '\t<defaultValue>false</defaultValue>\n';
  }
  return data.defaultValue ? `\t<defaultValue>${data.defaultValue}</defaultValue>\n` : '';
};

const getValueSet = (data: CustomField): string => {
  let fieldValue = '';
  if (data.valueSet) {
    fieldValue += '\t<valueSet>\n';
    fieldValue += `\t\t<restricted>${data.valueSet.restricted ?? false}</restricted>\n`;
    fieldValue += '\t\t<valueSetDefinition>\n';
    fieldValue += `\t\t\t<sorted>${data.valueSet.valueSetDefinition?.sorted ?? false}</sorted>\n`;
    data.valueSet.valueSetDefinition?.value.forEach((value) => {
      fieldValue += '\t\t\t<value>\n';
      fieldValue += `\t\t\t\t<fullName>${value.fullName}</fullName>\n`;
      fieldValue += `\t\t\t\t<default>${value.default || false}</default>\n`;
      fieldValue += `\t\t\t\t<label>${value.label}</label>\n`;
      fieldValue += '\t\t\t</value>\n';
    });
    fieldValue += '\t\t</valueSetDefinition>\n';
    fieldValue += '\t</valueSet>\n';
  }
  return fieldValue;
};

const getConvertType = (data: CustomField): string => {
  if (
    data.type === 'Html' ||
    data.type === 'MultiselectPicklist' ||
    (data.type === 'Text' && data.length === undefined)
  ) {
    return 'LongTextArea';
  } else {
    return 'Text';
  }
};

const getFullName = (data: CustomField): string => {
  const name = data.fullName?.endsWith('__c') ? data.fullName : `${data.fullName}__c`;
  return `\t<fullName>${name}</fullName>\n`;
};

const getDescription = (data: CustomField): string =>
  data.description ? `\t<description>${data.description}</description>\n` : '';

const getExternalId = (data: CustomField): string =>
  data.externalId ? `\t<externalId>${data.externalId}</externalId>\n` : '';

const getFieldManageability = (data: CustomField): string =>
  `\t<fieldManageability>${data.fieldManageability ?? 'DeveloperControlled'}</fieldManageability>\n`;

const getInlineHelpText = (data: CustomField): string =>
  data.inlineHelpText ? `\t<inlineHelpText>${data.inlineHelpText}</inlineHelpText>\n` : '';

const getLabel = (data: CustomField): string => `\t<label>${data.label}</label>\n`;

const getRequiredTag = (data: CustomField): string =>
  typeof data.unique === 'boolean' ? `\t<unique>${data.unique}</unique>\n` : '';

const getPrecisionTag = (data: CustomField): string =>
  data.precision ? `\t<precision>${data.precision}</precision>\n` : '';

const getScaleTag = (data: CustomField): string =>
  typeof data.scale !== 'undefined' ? `\t<scale>${data.scale}</scale>\n` : '';
