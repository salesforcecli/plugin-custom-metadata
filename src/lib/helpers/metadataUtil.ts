import { core } from '@salesforce/command';
import { AnyJson, toAnyJson } from '@salesforce/ts-types';

export class MetadataUtil {

  private conn: core.Connection;
  constructor(connection: core.Connection) {
    this.conn = connection;
  }
    /**
     * Returns a describe object from the API name you specify
     *
     * @param  objName API name of the object
     * @returns Promise - JSON representation of the describe object
     */
    public async describeObj(objName: string): Promise<AnyJson> {
      const result = await this.conn.metadata.read('CustomObject', objName, (err, meta) => {
        if (err) {
          console.error(err);
          return err;
        }
        console.log(meta);
        return meta;
      });

      return toAnyJson(result);
    }

    /**
     * Returns an array of object records from a SOQL query
     *
     * @param  soqlStr String representation of the SOQL query
     * @returns Promise - Array of records in JSON format
     */
    public async queryObject(soqlStr: string): Promise<AnyJson> {
      const result = await this.conn.query(soqlStr, {}, (err, meta) => {
        if (err) {
          console.error(err);
          return err;
        }

        return meta;
      });

      return toAnyJson(result);
    }

    /**
     * Returns an array of object records
     *
     * @param  describeResult object describe result
     * @returns Promise - Promise - Array of records in JSON format
     */
    public async queryRecords(describeResult: AnyJson): Promise<AnyJson> {
      const query = await this._getSoqlQuery(describeResult['fields'], describeResult['fullName']);
      const queryResult = await this.queryObject(query);

      return toAnyJson(queryResult);
    }

    /**
     * Returns describe object for the field API name from the Object API name you specify
     *
     * @param  objDescribe  describe object JSON
     * @param  fieldName API name of the field to query
     * @returns Promise - Promise - record in JSON format
     */
    public describeField(objDescribe: AnyJson, fieldName: string): AnyJson {
      const fieldsDescribe  = objDescribe['fields'];
      let fieldsDescribeResult;
      fieldsDescribe.map(field => {
        if (field.fullName === fieldName) {
          fieldsDescribeResult = field;
        }
      });

      return fieldsDescribeResult;
    }

    /**
     * Returns describe object for all fields from the object  API name you specify
     *
     * @param  objDescribe object describe JSON
     * @returns Promise - Promise - record in JSON format
     */
    public describeObjFields(objDescribe: AnyJson): AnyJson {
      const fieldsDescribe  = objDescribe['fields'];

      return fieldsDescribe;
    }

    /**
     * Returns true if the object name you specify is a list type custom setting
     *
     * @param  objName API name of the object to query
     * @returns boolean
     */
    public validCustomSettingType(objDescribe: AnyJson): boolean {
      if (objDescribe['customSettingsType'] === 'List' && objDescribe['visibility'] === 'Public') {
        return true;
      }
      return false;
    }

    public getCleanQueryResponse(sObjecRecord: AnyJson): any {
      const record: any = {};
      console.log(sObjecRecord);
      Object.keys(sObjecRecord).forEach(fieldName => {
          if (fieldName !== 'attributes' && fieldName !== 'Name') {
            record[fieldName] = sObjecRecord[fieldName];
          }
        }
          );
      return record;
    }

    private _getSoqlQuery(arr, objName) {
      const fieldNames = arr.map(field => {
        return field.fullName;
      }).join(',');
      // Added Name hardcoded as Name field is not retreived as part of object describe.
      return `SELECT Name, ${fieldNames} FROM ${objName}`;
    }
}
