import { core } from '@salesforce/command';
import { AnyJson, toAnyJson } from '@salesforce/ts-types';

export class MetdataUtil {
    /**
     * Returns a describe object from the API name you specify
     *
     * @param  objName API name of the object
     * @param  conn Current Connection object
     * @returns Promise - JSON representation of the describe object
     */
    public async describeObj(objName: string, conn: core.Connection): Promise<AnyJson> {
      const result = await conn.metadata.read('CustomObject', objName, (err, meta) => {
        if (err) {
          console.error(err);
          return err;
        }

        return meta;
      });

      return toAnyJson(result);
    }

    /**
     * Returns an array of object records from a SOQL query
     *
     * @param  soqlStr String representation of the SOQL query
     * @param  conn Current Connection object
     * @returns Promise - Array of records in JSON format
     */
    public async queryObject(soqlStr: string, conn: core.Connection): Promise<AnyJson> {
      const result = await conn.query(soqlStr, {}, (err, meta) => {
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
     * @param  objName API name of the object to query
     * @param  conn Current Connection object
     * @returns Promise - Promise - Array of records in JSON format
     */
    public async queryRecords(objName: string, conn: core.Connection): Promise<AnyJson> {
      const describeResult = await this.describeObj(objName, conn);
      const query = await this._getSoqlQuery(describeResult['fields'], objName);
      const queryResult = await this.queryObject(query, conn);

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
        if (field.name === fieldName) {
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
     * @param  conn Current Connection object
     * @returns boolean
     */
    public validCustomSettingType(objDescribe: AnyJson): boolean {
      if (objDescribe['customSettingsType'] === 'List' && objDescribe['visibility'] === 'Public') {
        return true;
      }
      return false;
    }

    private _getSoqlQuery(arr, objName) {
      const fieldNames = arr.map(field => {
        return field.name;
      }).join(',');

      return `SELECT ${fieldNames} FROM ${objName}`;
    }
}
