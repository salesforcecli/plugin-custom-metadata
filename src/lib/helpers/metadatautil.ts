import { AnyJson, toAnyJson } from '@salesforce/ts-types';
import {core} from '@salesforce/command';

export class MetdataUtil {
    /**
     * Returns a describe object from the API name you specify
     *
     * @param  objName API name of the object
     * @param  conn Current Connection object
     * @returns Promise - JSON representation of the describe object
     */
    public async describeObj(objName: string, conn: core.Connection): Promise<AnyJson> {
      let result = await conn.describe(objName, (err, meta) => {
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
      let result = await conn.query(soqlStr, {}, (err, meta) => {
        if (err) {
          console.error(err);
          return err;
        }

        return meta;
      });

      return toAnyJson(result);
    };

    /**
     * Returns an array of object records
     *
     * @param  objName API name of the object to query
     * @param  conn Current Connection object
     * @returns Promise - Promise - Array of records in JSON format
     */
    public async queryRecords(objName: string, conn: core.Connection): Promise<AnyJson> {
      let describeResult = await this.describeObj(objName, conn);
      let query = await this._getSoqlQuery(describeResult['fields'], objName);
      let queryResult = await this.queryObject(query, conn);

      return toAnyJson(queryResult);
    };

    private _getSoqlQuery(arr, objName) {
      let fieldNames = arr.map(field => {
        return field.name;
      }).join(',');

      return `SELECT ${fieldNames} FROM ${objName}`;
    }

    /**
     * Returns describe object for the field API name from the Object API name you specify
     *
     * @param  objName API name of the object to query
     * @param  fieldName API name of the field to query
     * @param  conn Current Connection object
     * @returns Promise - Promise - record in JSON format
     */
    public async describeField(objName: string, fieldName: string, conn: core.Connection): Promise<AnyJson> {
      const describeObjResult = await this.describeObj(objName, conn);
      const fieldsDescribe  = describeObjResult['fields']
      let fieldsDescribeResult
      fieldsDescribe.forEach(field => {
        if (field.name === fieldName) {
          fieldsDescribeResult = field;
        }
      });

      return toAnyJson(fieldsDescribeResult);
    }

    /**
     * Returns describe object for all fields from the object  API name you specify
     *
     * @param  objName API name of the object to query
     * @param  conn Current Connection object
     * @returns Promise - Promise - record in JSON format
     */
    public async describeObjFields(objName: string,  conn: core.Connection): Promise<AnyJson> {
      const describeObjResult = await this.describeObj(objName, conn);
      const fieldsDescribe  = describeObjResult['fields']
      let fieldsDescribeResult = []
      fieldsDescribe.forEach(field => {
          fieldsDescribeResult.push(field);
      });

      return toAnyJson(fieldsDescribeResult);
    }

    /**
     * Returns true if the object name you specify is a list type custom setting
     *
     * @param  objName API name of the object to query
     * @param  conn Current Connection object
     * @returns Promise - Promise - record in JSON format
     */
    public async validCustomSettingType(objName: string, conn: core.Connection): Promise<boolean> {
      const describeObjResult = await this.describeObj(objName, conn);
      const customSetting = describeObjResult['customSetting'];
      const nameField = await this.describeField(objName, 'Name', conn)
      if (customSetting && !nameField['nillable']) {
        return true;
      }
      return false;
    }
}

