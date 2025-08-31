/*
 * Copyright 2025, Salesforce, Inc.
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
import fs from 'node:fs';
import path from 'node:path';
import type { CustomField } from '@jsforce/jsforce-node/lib/api/metadata.js';
import { XMLParser } from 'fast-xml-parser';
import { CreateConfig } from '../interfaces/createConfig.js';
import { canConvert } from '../templates/templates.js';

type CustomFieldFile = {
  CustomField: CustomField;
};

const fieldTypeMap = new Map<string, string>([
  ['Checkbox', 'boolean'],
  ['Date', 'date'],
  ['DateTime', 'dateTime'],
  ['Email', 'string'],
  ['Phone', 'string'],
  ['Picklist', 'string'],
  ['Text', 'string'],
  ['TextArea', 'string'],
  ['LongTextArea', 'string'],
  ['Url', 'string'],
]);
// NOTE: the template string indentation is important to output well-formatted XML. Altering that whitespace will change the whitespace of the output.
/**
 * Number and Percent types will be int or double depending on their respective scale values.
 * If the scale === 0, it is an int, otherwise it is a double
 */

/**
 *
 * @param fieldDirPath path to a /fields folder that contains all the fields to read
 * @param fileNames filenames in that folder that should be read
 * @returns CustomField[]
 */
export const getFileData = async (fieldDirPath: string, fileNames: string[]): Promise<CustomField[]> => {
  const parser = new XMLParser();
  return Promise.all(
    fileNames
      .map((file) => path.join(fieldDirPath, file))
      .map(async (filePath) => {
        const fileData = await fs.promises.readFile(filePath, 'utf8');
        return (parser.parse(fileData) as CustomFieldFile).CustomField;
      })
  );
};

/**
 * Get the field type from the custom metadata type that has a matching field name.
 *
 * @param  fileData Array of objects based on metadata type xml
 * @param  fieldName Name of the field
 * @return {string} Data Type of the field.
 */
export const getFieldDataType = (fileData: CustomField[] = [], fieldName = ''): CustomField['type'] =>
  fileData.find((file) => file.fullName === fieldName)?.type;

/**
 * Creates the Custom Metadata Record
 *
 * @param  createConfig Properties include typename, recname, label, protection, varargs, and fileData
 * @return void
 */
export const createRecord = async (createConfig: CreateConfig): Promise<void> => {
  const outputFilePath = path.join(
    createConfig.outputdir,
    `${createConfig.typename}.${createConfig.recordname}.md-meta.xml`
  );
  const newRecordContent = getRecordTemplate(
    createConfig.label,
    createConfig.protected,
    buildCustomFieldXml(createConfig.fileData, createConfig.varargs, createConfig.ignorefields)
  );

  return fs.promises.writeFile(outputFilePath, newRecordContent);
};

/**
 * Get the field primitive type from the custom metadata type that has a matching field name.
 *
 * @param  fileData Array of objects based on metadata type xml
 * @param  fieldName Name of the field
 * @return {string} Type used by a custom metadata record
 */
export const getFieldPrimitiveType = (fileData: CustomField[] = [], fieldName?: string): string => {
  const matchingFile = fileData.find((file) => file.fullName === fieldName);
  if (matchingFile && typeof matchingFile.type === 'string' && ['Number', 'Percent'].includes(matchingFile.type)) {
    return getNumberType(matchingFile.type, matchingFile.scale);
  }
  if (matchingFile && typeof matchingFile.type === 'string') {
    return fieldTypeMap.get(matchingFile.type) ?? 'string';
  }
  return 'string';
};

/**
 * Filenames should have the suffix of '__mdt'. This will append that suffix if it does not exist.
 *
 * @param  typename Name of file
 */
export const appendDirectorySuffix = (typename: string): string =>
  typename.endsWith('__mdt') ? typename : `${typename}__mdt`;

/**
 * Goes through the file data that has been generated and gets all of the field names and adds the
 * name of the field that is used as the label for metadata record
 *
 * @param  fileData Array of objects based on metadata type xml
 * @param  nameField name of the column that is going to be used for the name of the metadata record
 * @return [] Array of field names
 */
export const getFieldNames = (fileData: CustomField[], nameField: string): string[] => [
  ...fileData.map((file) => file.fullName).filter((f): f is string => typeof f === 'string'),
  nameField,
];

/**
 * Takes JSON representation of CLI varargs and converts them to xml with help
 * from helper.getFieldTemplate
 *
 * @param  cliParams Object that holds key:value pairs from CLI input
 * @param  fileData Array of objects that contain field data
 * @return {string} String representation of XML
 */
export const buildCustomFieldXml = (
  fileData: CustomField[] = [],
  cliParams: Record<string, string> = {},
  ignoreFields = false
): string =>
  Object.entries(cliParams)
    .filter(
      ([fieldName, value]) =>
        value !== undefined && (canConvert(getFieldDataType(fileData, fieldName)) || !ignoreFields)
    )
    .map(([fieldName, value]) => getFieldTemplate(fieldName, value, getFieldPrimitiveType(fileData, fieldName)))
    .join('');

/**
 * Get the number type based on the scale.
 * If the scale === 0, it is an int, otherwise it is a double.
 *
 * @param  type Number or Percent
 * @param  scale 0 or another number
 * @return {string} int or double
 */
const getNumberType = (type: string, scale: number | null | undefined): 'int' | 'double' =>
  ['Number', 'Percent'].includes(type) && scale === 0 ? 'int' : 'double';

/**
 * Template for a single customMetadata record value. This is used by helper.getRecordTemplate.
 *
 * @param  fieldName Field API Name (i.e, Foo__c)
 * @param  val Value of the field
 * @param  type Field type (i.e. boolean, dateTime, date, string, double)
 * @return {string} String representation of XML
 */
const getFieldTemplate = (fieldName: string, val: string, type: string): string => {
  const cleanValue = String(val).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const value =
    val === null || val === '' ? '<value xsi:nil="true"/>' : `<value xsi:type="xsd:${type}">${cleanValue}</value>`;

  return `
    <values>
        <field>${fieldName}</field>
        ${value}
    </values>`;
};

/**
 * Template to compile entire customMetadata record
 *
 * @param  label Name of the record
 * @param  protection Is the record protected?
 * @param  values Template string representation of values
 * @return {string} String representation of XML
 */
const getRecordTemplate = (label: string, protection = false, values: string): string =>
  `
<?xml version="1.0" encoding="UTF-8"?>
<CustomMetadata xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
    <label>${label}</label>
    <protected>${protection}</protected>${values}
</CustomMetadata>`.trim();
