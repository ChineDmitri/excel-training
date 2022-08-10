import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

import { IFile } from '../interfaces/firebase.interfase';

import { AdminService } from './admin.service';

import {
  AdminAuthDto,
  CreateQuestionDto,
  CreateUsersDto,
  NewPasswordDto,
} from './dto/admin.dto';

import {
  OneQuestion,
  ResponseAuth,
  ResponseMessageOnly,
} from './entities/admin.entity';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /*
   * ROUTE for login
   */
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

  /*
   * ROUTE for reinitilization password administrator
   */
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

  /*
   * ROUTE for create users
   */
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

  /*
   * ROUTE for create question
   */
  @Post('create-question')
  @HttpCode(201)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'imgTest', maxCount: 1 },
      // { name: 'imgResponse1', maxCount: 1 },
      // { name: 'imgResponse2', maxCount: 1 },
    ]),
  )
  async creteQuestion(
    // @Body() data_fields: any,
    @UploadedFiles()
    files: {
      imgTest: IFile[] | undefined;
      /* 
      imgResponse1: IFile[] | undefined;
      imgResponse2: IFile[] | undefined; 
      */
    },
    @Body() data: CreateQuestionDto,
    @Res() response: Response,
  ): Promise<string> {
    const questionId = await this.adminService.createQuestion(
      files.imgTest,
      data,
    );
    // console.log('TITLE', files.imgTest);
    // console.log('REZPONSE 1 ', files.imgResponse1);
    // console.log('REZPONSE 2 ', files.imgResponse2);
    // console.log('FILES', files, '\n');

    // const arr = [];

    // arr.push(files.imgTest, files.imgResponse1, files.imgResponse2);

    // console.log('data', data);

    response
      .status(201)
      .json({ message: `Create question avec id: ${questionId}` });
    return `Create question avec id: ${questionId}`;
  }

  @Delete('question/:id')
  @HttpCode(200)
  async deletOneQuestion(
    @Param('id') questionId: number,
    @Res() response: Response,
  ): Promise<ResponseMessageOnly> {
    const message = await this.adminService.deleteQuestionById(questionId);

    response.json({ message });

    return { message };
  }

  @Put('question/:id')
  @HttpCode(200)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'imgTest', maxCount: 1 }]))
  async updateOneQuestion(
    @UploadedFiles()
    files: {
      imgTest: IFile[] | undefined;
    },
    @Param('id') questionId: number,
    @Body() data: CreateQuestionDto,
    @Res() response: Response,
  ): Promise<ResponseMessageOnly> {
    const message: string = await this.adminService.updateQuestionById(
      questionId,
      data,
      files.imgTest,
    );

    response.json({ message });
    return { message };
  }

  /*
   * ROUTE for get one question by ID
   */
  @Get('question/:id')
  @HttpCode(200)
  async getOneQuestion(@Param('id') questionId: number): Promise<OneQuestion> {
    console.log(
      (await this.adminService.getQuestionById(questionId)).is_response1
        ? 'true'
        : 'false',
    );

    console.log(
      (await this.adminService.getQuestionById(questionId)).is_response2
        ? 'true'
        : 'false',
    );

    return this.adminService.getQuestionById(questionId);
  }
}
