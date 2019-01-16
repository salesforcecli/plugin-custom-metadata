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
}

