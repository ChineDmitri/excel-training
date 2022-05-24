import {
  Body,
  Controller,
  HttpCode,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';

import { AdminService } from './admin.service';

import { AdminAuthDto, CreateUsersDto, NewPasswordDto } from './dto/admin.dto';

import { ResponseAuth, ResponseMessageOnly } from './entities/admin.entity';

// import { admin } from
import * as firebaseAdmin from 'firebase-admin';

import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes } from 'firebase/storage';
import { default as serviceAccount } from '../excel-tosa-firebase-adminsdk.json';
import { FileInterceptor } from '@nestjs/platform-express';

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

  @Post('test')
  @UseInterceptors(FileInterceptor('file'))
  testUpload(@Body() data: any, @UploadedFile() file) {
    console.log(file.buffer);

    // const admin = require('firebase-admin');
    // const serviceAccount = require('../excel-tosa-firebase-adminsdk.json');
    // admin.initializeApp({
    //   credential: admin.credential.cert(serviceAccount),
    // });
    // firebaseAdmin.initializeApp({
    //   credential: firebaseAdmin.credential.cert(serviceAccount),
    // });
    // const firebaseDb = firebaseAdmin.firestore();
    // console.log(firebaseDb);
    // console.log(req);
    const firebase = initializeApp(serviceAccount);
    const storage = getStorage(firebase);

    const storageRef = ref(storage, 'some-child.jpg');

    uploadBytes(storageRef, file.buffer).then((snapshot) => {
      console.log(snapshot);
      console.log('Uploaded a blob or file!');
    });

    /* // Create a reference to 'mountains.jpg'
    const mountainsRef = ref(
      storage,
      `C:\Users\Stagiaire\OneDrive\Desktop\appImg\excel-training\server\src\admin\cc_.jpg`,
    );

    // Create a reference to 'images/mountains.jpg'
    const mountainImagesRef = ref(
      storage,
      `C:\Users\Stagiaire\OneDrive\Desktop\appImg\excel-training\server\src\admin\cc_.jpg`,
    ); */
    // console.log('mountainsRef', mountainsRef);
    // console.log('mountainImagesRef', mountainImagesRef);
  }
}
