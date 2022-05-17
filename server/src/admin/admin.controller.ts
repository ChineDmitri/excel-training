import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import { Response } from 'express';

import { AdminService } from './admin.service';

import { AdminAuthDto, CreateUsersDto } from './dto/admin.dto';

import { ResponseAuth, ResponseMessageOnly } from './entities/admin.entity';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

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

  @Post('create-user')
  @HttpCode(200)
  async creteUser(
    @Body() data: CreateUsersDto,
    @Res() response: Response,
  ): Promise<ResponseMessageOnly> {
    const message = await this.adminService.createUsers(data.users);

    response.json({ message });

    return message;
  }
}
