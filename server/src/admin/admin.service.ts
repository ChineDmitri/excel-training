import { Injectable } from '@nestjs/common';

import * as nodemailer from 'nodemailer';
import { AES } from 'crypto-js';
import { compare, hashSync } from 'bcrypt';
import { sign } from 'jsonwebtoken';

import { AdminQuery } from '../database/admin.query';

import { ResponseAuth, ResponseMessageOnly } from './entities/admin.entity';

import { AdminAuthDto, NewPasswordDto, NewUser } from './dto/admin.dto';

import { IAdmin } from '../interfaces/admin.interface';
import { IUser } from '../interfaces/user.interface';

@Injectable()
export class AdminService {
  constructor(private readonly adminQuery: AdminQuery) {}

  /* AUTHENTIFICATION */
  async authentification(admin: AdminAuthDto) {
    const objRes: ResponseAuth = {
      isAuth: false,
      message: '',
    };

    // recherche administrateur par son login
    const adminData: IAdmin = await this.adminQuery
      .findAdmin(admin.login)
      .then((admin) => {
        return admin;
      });

    // si on ne trouve pas administrateur n'authentifié pas
    if (adminData === undefined) {
      objRes.isAuth = false;
      objRes.message = "Nom d'administateur n'est pas correct";

      return { objRes };
    }

    // verification de mot de pass avec bcrypt
    const verificationPassword: boolean = await compare(
      admin.password,
      adminData.password,
    ).then((log) => {
      return log;
    });

    if (verificationPassword) {
      const token = sign(
        {
          id: adminData.id,
          login: adminData.login,
        },
        process.env.jwt_key,
        { expiresIn: '24h' },
      );

      objRes.isAuth = true;
      objRes.message = `Binvenue ${admin.login}`;

      // mot de passe correct, response avec jwt token
      return { objRes, token };
    } else {
      objRes.isAuth = false;
      objRes.message = 'Mod de passe ou login ne sont pas correct';

      // mot de passe erroné
      return { objRes };
    }
  }

  /* Modification old password */
  async updateAdminPassword(
    data: NewPasswordDto,
    login: string,
  ): Promise<ResponseMessageOnly> {
    // searche admin
    const adminData: IAdmin = await this.adminQuery
      .findAdmin(login)
      .then((admin) => {
        return admin;
      });

    /* verification mot de passe */
    try {
      const verificationPassword: boolean = await compare(
        data.oldPassword,
        adminData.password,
      ).then((log) => {
        return log;
      });

      if (!verificationPassword) {
        throw "Ancien mot de passe n'est pas correct";
      }

      if (data.newPassword_1 !== data.newPassword_2) {
        throw 'Nouveau mot de passe il faut remplire correctement!';
      }
    } catch (err) {
      return { status: false, message: err }; // returne false for response with code 400 Bad Request
    }

    const newPassword = hashSync(
      data.newPassword_1,
      parseInt(process.env.salt_of_round, 10),
    );

    const responseMessage = await this.adminQuery.updatePassword(
      login,
      newPassword,
      1,
    );

    return { status: true, message: responseMessage };
  }

  /* FOR SEND MESSAGE */
  async sendMail(message): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: 'smtp.' + process.env.hostSMTP,
      port: parseInt(process.env.portSMTP, 10),
      auth: {
        user: process.env.userSMTP + '@ethereal.email',
        pass: process.env.passSMTP,
      },
    });

    await transporter.sendMail(message);
  }

  /* CREATE USERS */
  async createUsers(users: NewUser[]): Promise<string> {
    const newUsers: IUser[] = [];
    /* CREATION USER ONE BY ONE */
    for (const user of users) {
      const newUser: IUser = {
        login: user.login,
        email: '',
        password: '',
      };

      newUser.email = AES.encrypt(user.email, process.env.AES_key).toString(); // encrypt email

      newUser.password = newUser.email.substring(0, 8); // 8 first sympol for password from email hash

      const messageForEmail = {
        from: `Mailler test <${process.env.userSMTP}@${process.env.hostSMTP}>`,
        to: user.email,
        subject: 'Enregistrement sur platforme ExcellentRANS',
        text: `Vous etes enregistré sur platform ExcellentRANS
    
        login: ${newUser.login}
        password: ${newUser.password}
    
        Ne repondez pas au cette courriel`,
      };

      // console.log('avant', newUser, test);

      this.sendMail(messageForEmail); // SEND MESSAGE FOR USER WITH HIS CREDENTIALS

      // console.log(newUser);

      newUser.password = hashSync(
        newUser.password,
        parseInt(process.env.salt_of_round, 10),
      ); // ReAssigne password with bcrypt

      newUsers.push(newUser); // add in array newUser
    }
    // console.log(newUsers);

    return this.adminQuery.createUsers(newUsers);
  }
}
