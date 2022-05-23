import {
  Body,
  Controller,
  HttpCode,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Response } from 'express';

import { AdminService } from './admin.service';

import { AdminAuthDto, CreateUsersDto, NewPasswordDto } from './dto/admin.dto';

import { ResponseAuth, ResponseMessageOnly } from './entities/admin.entity';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /* ROUTE for login */
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() admin: AdminAuthDto,
    @Res() response: Response,
  ): Promise<ResponseAuth> {
    const authentification: any = await this.adminService.authentification(
      admin,
    );

    response.cookie('token', authentification.token, {
      maxAge: 60000 * 60 * 24, // max vie 1 jour
      httpOnly: true,
      // secure: true, // en production
    });

    if (authentification.objRes.isAuth) {
      response.json(authentification.objRes);
      return authentification.objRes;
    } else {
      response.status(401).json(authentification.objRes);
      return authentification.objRes;
    }
  }

  /* ROUTE for reinitilization password */
  @Patch('new-password')
  @HttpCode(200)
  async newPassword(
    @Body() data: NewPasswordDto,
    @Res() response: Response,
  ): Promise<ResponseMessageOnly> {
    const dataService = await this.adminService.updateAdminPassword(
      data,
      response.locals.adminToken.login, // get login for searche in DB
    );

    dataService.status /* IF status false code response 200 */
      ? response.json({ message: dataService.message })
      : response.status(400).json({ message: dataService.message });

    return dataService;
  }

  /* ROUTE for create users */
  @Post('create-user')
  @HttpCode(200)
  async creteUser(
    @Body() data: CreateUsersDto,
    @Res() response: Response,
  ): Promise<ResponseMessageOnly> {
    const message: any = await this.adminService.createUsers(data.users);

    response.json({ message });

    return message;
  }
}
