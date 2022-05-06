import { Injectable } from '@nestjs/common';

import { AdminQuery } from '../database/admin.query';

import * as nodemailer from 'nodemailer';
import { createHmac } from 'crypto';
import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';

import { ResponseAuth } from './entities/admin.entity';

import { AdminAuthDto, CreateUsersDto } from './dto/adminAuth.dto';

import { IAdmin } from '../interfaces/admin.interfaces';
import { IUser } from '../interfaces/user.interfaces';

@Injectable()
export class AdminService {
  constructor(private readonly adminQuery: AdminQuery) {}

  async authentification(admin: AdminAuthDto) {
    const objRes: ResponseAuth = {
      isAuth: false,
      message: '',
    };

    // recherche administrateur par son login
    const adminData: IAdmin = await this.adminQuery
      .findAdmin(admin.login)
      .then((admin) => {
        return admin[0];
      });

    // si on ne trouve pas administrateur n'authentifié pas
    if (adminData === undefined) {
      objRes.isAuth = false;
      objRes.message = "Nom d'administateur n'est pas correct";

      return { objRes };
    }

    // verification de mot de pass avec bcrypt
    const verification: boolean = await compare(
      admin.password,
      adminData.password,
    ).then((log) => {
      return log;
    });

    if (verification) {
      const token = sign(
        {
          userId: adminData.id,
          login: adminData.login,
        },
        process.env.jwtKey,
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

  sendMail(message): void {
    const transporter = nodemailer.createTransport({
      host: 'smtp.' + process.env.hostSMTP,
      port: parseInt(process.env.portSMTP, 10),
      auth: {
        user: process.env.userSMTP + '@ethereal.email',
        pass: process.env.passSMTP,
      },
    });

    transporter.sendMail(message);
  }

  async createUsers(users: CreateUsersDto[]) {
    for (const user of users) {
      const newUser: IUser = {
        login: user.login,
        email: user.email,
        password: '',
      };

      const passwordUser = createHmac('sha256', process.env.sha256_password)
        .update(user.email)
        .digest('hex')
        .substring(0, 5);

      newUser.password = passwordUser;

      const messageForEmail = {
        from: 'Mailler test <letitia.tillman91@ethereal.email>',
        to: newUser.email,
        subject: 'Enregistrement sur platforme ExcellentRANS',
        text: `Vous etes enregistré sur platform ExcellentRANS
    
        login: ${newUser.login}
        password: ${newUser.password}
    
        Ne repondez pas au cette courriel`,
      };

      console.log(newUser);

      this.sendMail(messageForEmail);
    }
  }
}
