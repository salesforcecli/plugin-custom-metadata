import { AnyJson, toAnyJson } from '@salesforce/ts-types';
import {core} from '@salesforce/command';

export class MetdataUtil {
    
    public async describe(objName: string, conn: core.Connection): Promise<AnyJson> {
        let result = await conn.describe(objName, (err, meta) => {
          return new Promise((resolve, reject) => {
            if (err) {
              reject(err);
            } else {
              resolve(meta);
            }
          })
        });
        return toAnyJson(result);
    };

    public async query(objName: string, connection: core.Connection): Promise<AnyJson> {
      const objDescribe =  await connection.describe(objName);
      if (objDescribe.fields) {
        let soql = "SELECT ";
        objDescribe.fields.forEach(field => {
          soql+=(field.name +", ");
        });
        soql = soql.slice(0, -2)+" FROM "+ objName;
        let queryResult = await connection.query(soql, {}, (err, result) => {
          return new Promise((resolve, reject) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          })
        });
        return toAnyJson(queryResult);
      } 
    };
}

