import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { verify } from 'jsonwebtoken';

import { AdminQuery } from '../database/admin.query';

import { IAdmin } from '../interfaces/admin.interface';
import { IDecodedToken } from '../interfaces/jwt.interface';

@Injectable()
export class AuthAdminMiddleware implements NestMiddleware {
  constructor(private readonly adminQuery: AdminQuery) {}

  async use(request: Request, response: Response, next: () => void) {
    const cookieToken = request.cookies.token;

    try {
      if (cookieToken === undefined) {
        throw "N'est pas authentifier";
      }

      /* ERROR TSLint
      Type 'string | JwtPayload' is not assignable to type 'IDecodedToken'.
      const decodedToken: IDecodedToken = verify(token, process.env.jwt_key);
      SOLUTION reAssigne new object */
      const jwtPayload: any = verify(cookieToken, process.env.jwt_key);
      const decodedToken: IDecodedToken = { ...jwtPayload };

      // save in locals token decoded token
      response.locals.adminToken = decodedToken;

      const admin: IAdmin = await this.adminQuery.findAdmin(decodedToken.login);

      if (admin.id !== decodedToken.id) {
        throw 'Token broken';
      }
    } catch (err) {
      return response.status(403).json({ message: err });
    }

    next();
  }
}
