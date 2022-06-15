import {
  Body,
  Controller,
  HttpCode,
  Patch,
  Post,
  Req,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

import { AdminService } from './admin.service';

import {
  AdminAuthDto,
  CreateQuestionDto,
  CreateUsersDto,
  NewPasswordDto,
} from './dto/admin.dto';

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

  /* ROUTE for create question */
  @Post('create-question')
  @HttpCode(201)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'imgTitle', maxCount: 1 },
      { name: 'imgResponse1', maxCount: 1 },
      { name: 'imgResponse2', maxCount: 1 },
    ]),
  )
  async creteQuestion(
    // @Body() data_fields: any,
    @UploadedFiles()
    file: { imgTitle: any; imgResponse1: any; imgResponse2: any },
    @Body() data: CreateQuestionDto,
    @Res() response: Response,
  ): Promise<any> {
    console.log('TITLE', file.imgTitle);
    console.log('REZPONSE 1 ', file.imgResponse1);
    console.log('REZPONSE 2 ', file.imgResponse2);

    console.log('Data', data);

    return 0;
  }
}
