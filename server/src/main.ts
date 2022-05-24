import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as mysql from 'mysql2';

import { AppModule } from './app.module';

import { configDataBase } from './database/config';
import { default as cookieParser } from 'cookie-parser';

// import { AuthAdminMiddleware } from './admin/auth-admin.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  // app.use(AuthAdminMiddleware);

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      // transform: false,
      transformOptions: { enableImplicitConversion: true },
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
