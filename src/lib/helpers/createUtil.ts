import { core } from '@salesforce/command';
import { parseString } from 'xml2js';
import { CreateConfig } from '../interfaces/createConfig';
import { CustomField } from '../interfaces/customField';

// NOTE: the template string indentation is important to output well-formatted XML. Altering that whitespace will change the whitespace of the output.
export class CreateUtil {

  private fieldTypeMap: object;

  /**
   * Number and Percent types will be int or double depending on their respective scale values.
   * If the scale === 0, it is an int, otherwise it is a double
   */
  constructor() {
    this.fieldTypeMap = {
      Checkbox: 'boolean',
      Date: 'date',
      DateTime: 'dateTime',
      Email: 'string',
      Phone: 'string',
      Picklist: 'string',
      Text: 'string',
      TextArea: 'string',
      LongTextArea: 'string',
      Url: 'string'
    };
  }

  /**
   * Creates the Custom Metadata Record
   *
   * @param  createConfig Properties include typename, recname, label, protection, varargs, and fileData
   * @return void
   */
  public async createRecord(createConfig: CreateConfig) {
    const outputFilePath = `${createConfig.outputdir}/${createConfig.typename}.${createConfig.recname}.md-meta.xml`;
    const newRecordContent = this.getRecordTemplate(
      createConfig.label,
      createConfig.protection,
      this.buildCustomFieldXml(createConfig.fileData, createConfig.varargs)
    );

    return core.fs.writeFile(outputFilePath, newRecordContent);
  }

  public async getFileData(fieldDirPath, fileNames) {
    const ret = [];
    let filePath = '';
    let fileData;
    let str = '';

    for (const file of fileNames) {
      filePath = `${fieldDirPath}/${file}`;
      fileData = await core.fs.readFile(filePath);
      str = fileData.toString('utf8');

      parseString(str, (err, res) => {
        ret.push(res);
      });
    }

    return ret;
  }

  /**
   * Filenames should have the suffix of '__mdt'. This will append that suffix if it does not exist.
   *
   * @param  typename Name of file
   */
  public appendDirectorySuffix(typename: string) {
    if (typename.endsWith('__mdt')) {
      return typename;
    } else {
      return typename + '__mdt';
    }
  }

  /**
   * Get the field type from the custom metadata type that has a matching field name.
   *
   * @param  fileData Array of objects based on metadata type xml
   * @param  fieldName Name of the field
   * @return {string} Type used by a custom metadata record
   */
  public getFieldType(fileData: CustomField[] = [], fieldName: string = '') {
    let thisFieldName = '';
    let type = '';
    let ret = 'string';

    for (const file of fileData) {
      thisFieldName = file.CustomField.fullName[0];
      type = file.CustomField.type[0];

      if (type === 'Number' || type === 'Percent') {
        ret = this.getNumberType(type, file.CustomField.scale[0]);
      } else {
        ret = this.fieldTypeMap[type];
      }

      if (thisFieldName === fieldName) {
        return ret;
      }
    }

    return ret;
  }

  /**
   * Takes JSON representation of CLI varargs and converts them to xml with help
   * from helper.getFieldTemplate
   *
   * @param  cliParams Object that holds key:value pairs from CLI input
   * @param  fileData Array of objects that contain field data
   * @return {string} String representation of XML
   */
  private buildCustomFieldXml(fileData: CustomField[], cliParams: object) {
    let ret = '';
    let type = '';

    for (const fieldName of Object.keys(cliParams)) {
      type = this.getFieldType(fileData, fieldName);
      ret += this.getFieldTemplate(fieldName, cliParams[fieldName], type);
    }

    return ret;
  }

  /**
   * Get the number type based on the scale.
   * If the scale === 0, it is an int, otherwise it is a double.
   *
   * @param  type Number or Percent
   * @param  scale 0 or another number
   * @return {string} int or double
   */
  private getNumberType(type: string, scale: string) {
    if (type === 'Number' && parseFloat(scale) === 0 || type === 'Percent' && parseFloat(scale) === 0) {
      return 'int';
    }

    return 'double';
  }

  /**
   * Template for a single customMetadata record value. This is used by helper.getRecordTemplate.
   *
   * @param  fieldName Field API Name (i.e, Foo__c)
   * @param  val Value of the field
   * @param  type Field type (i.e. boolean, dateTime, date, string, double)
   * @return {string} String representation of XML
   */
  private getFieldTemplate(fieldName: string, val: string, type: string) {
    return `
    <values>
        <field>${fieldName}</field>
        <value xsi:type="xsd:${type}">${val}</value>
    </values>`;
  }

  /**
   * Template to compile entire customMetadata record
   *
   * @param  label Name of the record
   * @param  protection Is the record protected?
   * @param  values Template string representation of values
   * @return {string} String representation of XML
   */
  private getRecordTemplate(label: string, protection: boolean, values: string) {
    return `
<?xml version="1.0" encoding="UTF-8"?>
<CustomMetadata xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
    <label>${label}</label>
    <protected>${protection}</protected>${values}
</CustomMetadata>`.trim();
  }
}
