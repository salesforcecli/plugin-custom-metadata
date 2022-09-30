/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'fs';
import * as path from 'path';
import { CustomField } from 'jsforce/api/metadata';
import { XMLParser } from 'fast-xml-parser';
import { CreateConfig } from '../interfaces/createConfig';
import { Templates } from '../templates/templates';

interface CustomFieldFile {
  CustomField: CustomField;
}

const fieldTypeMap = {
  Checkbox: 'boolean',
  Date: 'date',
  DateTime: 'dateTime',
  Email: 'string',
  Phone: 'string',
  Picklist: 'string',
  Text: 'string',
  TextArea: 'string',
  LongTextArea: 'string',
  Url: 'string',
};
// NOTE: the template string indentation is important to output well-formatted XML. Altering that whitespace will change the whitespace of the output.
export class CreateUtil {
  /**
   * Number and Percent types will be int or double depending on their respective scale values.
   * If the scale === 0, it is an int, otherwise it is a double
   */

  /**
   * Creates the Custom Metadata Record
   *
   * @param  createConfig Properties include typename, recname, label, protection, varargs, and fileData
   * @return void
   */
  public async createRecord(createConfig: CreateConfig): Promise<void> {
    const outputFilePath = path.join(
      createConfig.outputdir,
      `${createConfig.typename}.${createConfig.recordname}.md-meta.xml`
    );
    const newRecordContent = getRecordTemplate(
      createConfig.label,
      createConfig.protected,
      this.buildCustomFieldXml(createConfig.fileData, createConfig.varargs, createConfig.ignorefields)
    );

    return fs.promises.writeFile(outputFilePath, newRecordContent);
  }

  /**
   *
   * @param fieldDirPath path to a /fields folder that contains all the fields to read
   * @param fileNames filenames in that folder that should be read
   * @returns CustomField[]
   */
  // eslint-disable-next-line class-methods-use-this
  public async getFileData(fieldDirPath: string, fileNames: string[]): Promise<CustomField[]> {
    const parser = new XMLParser();
    return Promise.all(
      fileNames
        .map((file) => path.join(fieldDirPath, file))
        .map(async (filePath) => {
          const fileData = await fs.promises.readFile(filePath, 'utf8');
          return (parser.parse(fileData) as CustomFieldFile).CustomField;
        })
    );
  }

  /**
   * Filenames should have the suffix of '__mdt'. This will append that suffix if it does not exist.
   *
   * @param  typename Name of file
   */
  // eslint-disable-next-line class-methods-use-this
  public appendDirectorySuffix(typename: string): string {
    return typename.endsWith('__mdt') ? typename : `${typename}__mdt`;
  }

  /**
   * Get the field primitive type from the custom metadata type that has a matching field name.
   *
   * @param  fileData Array of objects based on metadata type xml
   * @param  fieldName Name of the field
   * @return {string} Type used by a custom metadata record
   */
  // eslint-disable-next-line class-methods-use-this
  public getFieldPrimitiveType(fileData: CustomField[] = [], fieldName?: string): string {
    const matchingFile = fileData.find((file) => file.fullName === fieldName);
    return matchingFile && ['Number', 'Percent'].includes(matchingFile.type)
      ? getNumberType(matchingFile.type, matchingFile.scale)
      : (fieldTypeMap[matchingFile?.type] as string) ?? 'string';
  }

  /**
   * Get the field type from the custom metadata type that has a matching field name.
   *
   * @param  fileData Array of objects based on metadata type xml
   * @param  fieldName Name of the field
   * @return {string} Data Type of the field.
   */
  // eslint-disable-next-line class-methods-use-this
  public getFieldDataType(fileData: CustomField[] = [], fieldName = ''): CustomField['type'] {
    return fileData.find((file) => file.fullName === fieldName)?.type;
  }

  /**
   * Goes through the file data that has been genreated and gets all of the field names and adds the
   * name of the field that is used as the label for metadata record
   *
   * @param  fileData Array of objects based on metadata type xml
   * @param  nameField name of the column that is going to be used for the name of the metadata record
   * @return [] Array of field names
   */
  // eslint-disable-next-line class-methods-use-this
  public getFieldNames(fileData: CustomField[], nameField: string): string[] {
    return [...fileData.map((file) => file.fullName), nameField];
  }

  /**
   * Takes JSON representation of CLI varargs and converts them to xml with help
   * from helper.getFieldTemplate
   *
   * @param  cliParams Object that holds key:value pairs from CLI input
   * @param  fileData Array of objects that contain field data
   * @return {string} String representation of XML
   */
  private buildCustomFieldXml(
    fileData: CustomField[],
    cliParams: Record<string, string>,
    ignoreFields: boolean
  ): string {
    let ret = '';
    const templates = new Templates();
    for (const fieldName of Object.keys(cliParams)) {
      const type = this.getFieldPrimitiveType(fileData, fieldName);
      const dataType = this.getFieldDataType(fileData, fieldName);
      // Added functionality to handle the igonre fields scenario.
      if (templates.canConvert(dataType) || !ignoreFields) {
        ret += getFieldTemplate(fieldName, cliParams[fieldName], type);
      }
    }

    return ret;
  }
}

/**
 * Get the number type based on the scale.
 * If the scale === 0, it is an int, otherwise it is a double.
 *
 * @param  type Number or Percent
 * @param  scale 0 or another number
 * @return {string} int or double
 */
const getNumberType = (type: string, scale: number): 'int' | 'double' =>
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
const getRecordTemplate = (label: string, protection: boolean, values: string): string =>
  `
<?xml version="1.0" encoding="UTF-8"?>
<CustomMetadata xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
    <label>${label}</label>
    <protected>${protection}</protected>${values}
</CustomMetadata>`.trim();
