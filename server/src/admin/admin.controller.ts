import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import { response, Response } from 'express';

import { AdminService } from './admin.service';

import { AdminAuthDto, CreateUsersDto } from './dto/adminAuth.dto';

import { ResponseAuth } from './entities/admin.entity';

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

    response.json(authentification.objRes);
    return authentification.objRes;
  }

  @Post('create-user')
  @HttpCode(200)
  creteUser(@Body() users: CreateUsersDto[], @Res() response: Response): any {
    this.adminService.createUsers(users);
    response.json({ message: `${users.length} utilisateur sont crée` });
  }
}
