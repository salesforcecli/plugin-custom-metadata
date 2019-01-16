import { AnyJson, toAnyJson } from '@salesforce/ts-types';
import {core} from '@salesforce/command';

export class MetdataUtil {

    public async describe(objName: string, conn: core.Connection): Promise<AnyJson> {
      let result = await conn.describe(objName, (err, meta) => {
        if (err) {
          console.error(err);
          return err;
        }

        return meta;
      });

      return toAnyJson(result);
    }

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

    public async query(objName: string, conn: core.Connection): Promise<AnyJson> {
      let describeResult = await this.describe(objName, conn);
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

