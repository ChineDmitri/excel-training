import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as mysql from 'mysql2';

import { AppModule } from './app.module';

import { configDataBase } from './database/config';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  await app.listen(3001);

  /* Test connection DataBase */
  const dataBase = mysql.createConnection(configDataBase);

  dataBase.connect((err) => {
    return console.log(
      err
        ? `DataBase connection --ERROR: ${err}`
        : 'Database connection --TEST: OK!',
    );
  });

  dataBase.end();
  /* End connection for DataBase */
}
bootstrap();
