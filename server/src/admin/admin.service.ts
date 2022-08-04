import { Injectable } from '@nestjs/common';

import * as nodemailer from 'nodemailer';
import { AES } from 'crypto-js';
import { compare, hashSync } from 'bcrypt';
import { sign } from 'jsonwebtoken';

import { AdminQuery } from '../database/admin.query';
import { AdminFirebase } from '../firebase/admin.firebase';

import {
  OneQuestion,
  ResponseAuth,
  ResponseMessageOnly,
} from './entities/admin.entity';

import {
  AdminAuthDto,
  CreateQuestionDto,
  NewPasswordDto,
  NewUser,
} from './dto/admin.dto';

import { IAdmin } from '../interfaces/admin.interface';
import { IUser } from '../interfaces/user.interface';

@Injectable()
export class AdminService {
  constructor(
    private readonly adminQuery: AdminQuery,
    private adminFirebase: AdminFirebase,
  ) {}

  /*
   * AUTHENTIFICATION
   */
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

  /*
   * MODIFICATION OLD PASSWORD
   */
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

  /*
   * FOR SEND MESSAGE
   */
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

  /*
   * CREATE USERS
   */
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

  /*
   * CREATE QUESTION
   */
  async createQuestion(files: any, data: CreateQuestionDto): Promise<string> {
    const nameImg = await this.adminFirebase.uploadImage(files.imgTest[0]); // files.imgTest[0] isArray donc first element in array
    /* 
    const imgResponse1 = await this.adminFirebase.uploadImage(files.imgResponse1[0]); // files.imgResponse1[0] isArray donc first element in array
    const imgResponse2 = await this.adminFirebase.uploadImage(files.imgResponse1[0]); // files.imgResponse1[0] isArray donc first element in array
    */

    // /*
    // TEST FOR EACH RESPONE FOR QUESTION
    // IF RESPONSE EMPTY SO IT'S NULL
    //  */
    // const response: IResponseForQuestion = {
    //   response1: data.response1 === '' ? null : data.response1,
    //   response2: data.response2 === '' ? null : data.response2,
    //   response3: data.response3 === '' ? null : data.response3,
    //   response4: data.response4 === '' ? null : data.response4,
    //   response5: data.response5 === '' ? null : data.response5,
    // };

    const questionId = await this.adminQuery.createQuestion(nameImg, data);

    return questionId;
  }

  /*
   * DELETE ONE QUESTION BY ID
   */
  async deleteQuestionById(id: number): Promise<string> {
    const question: OneQuestion = await this.getQuestionById(id);

    const deleteFile: string = await this.adminFirebase.deleteFile(
      question.img,
    ); // delete file from firebase

    console.log(deleteFile); // look for stat file

    const deleteQuestion = await this.adminQuery.deleteQuestion(id);

    return deleteQuestion;
  }

  /*
   * RETOURNED ONE QUESTION BY ID
   */
  async getQuestionById(id: number): Promise<OneQuestion> {
    const result = await this.adminQuery.getQuestion(id);

    return result[0];
  }
}
