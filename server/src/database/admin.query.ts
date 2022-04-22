import { Injectable } from '@nestjs/common';
import * as mysql from 'mysql2';

import { configDataBase } from './config';

@Injectable()
export class AdminQuery {
  findAdmin(login: string) {
    const dataBase = mysql.createConnection(configDataBase);

    const sql = `SELECT * FROM admin WHERE login='${login}'`;

    return dataBase
      .promise()
      .query(sql)
      .then((result) => {
        // console.log('promiss', result[0]);

        dataBase.end();

        return result[0];
      })
      .catch((err) => {
        console.log('err', err);
      });
  }
}
