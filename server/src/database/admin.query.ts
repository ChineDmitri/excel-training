import { Injectable } from '@nestjs/common';
import * as mysql from 'mysql2';
import { IUser } from '../interfaces/user.interfaces';

import { configDataBase } from './config';

@Injectable()
export class AdminQuery {
  findAdmin(login: string) {
    const dataBase = mysql.createConnection(configDataBase);

    const sql = `SELECT * FROM Admin WHERE login='${login}'`;

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

  createUsers(newUsers: IUser[]) {
    const dataBase = mysql.createConnection(configDataBase);

    let n = 0;

    let sql = `INSERT INTO User (login, password, email) VALUES `;

    // console.log(newUsers);

    newUsers.forEach((user) => {
      n++;

      if (n === newUsers.length) {
        sql += `('${user.login}', '${user.password}', '${user.email}');`;
      } else {
        sql += `('${user.login}', '${user.password}', '${user.email}'), `;
      }

      // console.log(sql);
    });

    return dataBase
      .promise()
      .query(sql)
      .then(() => {
        // console.log('promiss', result[0]);

        dataBase.end();

        return `Add ${newUsers.length} user(s)`;
      })
      .catch((err) => {
        console.log('err', err.sqlMessage);

        return err.sqlMessage;
      });
    // console.log(sql);
  }
}
