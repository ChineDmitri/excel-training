import { Injectable } from '@nestjs/common';

import { AdminQuery } from '../database/admin.query';

import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';

import { ResponseAuth } from './entities/admin.entity';

import { AdminAuthDto } from './dto/adminAuth.dto';

import { IAdmin } from '../interfaces/admin.interfaces';

@Injectable()
export class AdminService {
  constructor(private readonly adminQuery: AdminQuery) {}

  async login(admin: AdminAuthDto) {
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
        process.env.tokenKey,
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
}
