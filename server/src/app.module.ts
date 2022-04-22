import 'dotenv/config';

import { Module } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config';

import { AdminController } from './admin/admin.controller';
import { AdminService } from './admin/admin.service';
// import { configDataBase } from './database/config';
import { AdminQuery } from './database/admin.query';

@Module({
  imports: [
    // ConfigModule.forRoot({
    //   envFilePath: '.env',
    // }),
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminQuery],
})
export class AppModule {}
