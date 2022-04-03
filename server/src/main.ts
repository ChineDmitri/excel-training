import { NestFactory } from '@nestjs/core';
import * as mysql from 'mysql2';

import { AppModule } from './app.module';
import { configDataBase } from './database/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  app.setGlobalPrefix('api');

  await app.listen(3000);

  /* Test connection DataBase */
  const dataBase = mysql.createConnection(configDataBase);

  dataBase.connect((err) => {
    return console.log(
      err ? 'DataBase connection --ERROR:' : 'Database connection --TEST: OK!',
    );
  });

  dataBase.end();
  /* End connection for DataBase */
}
bootstrap();
