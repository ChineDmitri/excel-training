import { Injectable } from '@nestjs/common';
import * as mysql from 'mysql2';

import { configDataBase } from './config';

import { IUser } from '../interfaces/user.interface';

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

        return result[0][0];
      })
      .catch((err) => {
        dataBase.end();

        console.log('err', err);

        return err;
      });
  }

  createUsers(newUsers: IUser[]): Promise<string> {
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

        dataBase.end();

        return err.message;
      });

    // console.log(sql);
  }

  /* UPDATE PASSWORD */
  updatePassword(
    login: string,
    newPassword: string,
    whoIs: number = null,
  ): Promise<string> {
    const dataBase = mysql.createConnection(configDataBase);

    const table: string = whoIs === 1 ? 'admin' : 'user'; // 1 -> Admin ; undefined -> user

    const sql = `UPDATE ${table} SET password="${newPassword}" WHERE login="${login}"`;

    return dataBase
      .promise()
      .query(sql)
      .then(() => {
        dataBase.end();

        return 'Mot de passe a était changé';
      })
      .catch((err) => {
        console.log('err', err.sqlMessage);

        dataBase.end();

        return err.message;
      });
  }
}
