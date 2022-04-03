import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AdminController } from './admin/admin.controller';
import { AdminService } from './admin/admin.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.dev.env'] /* path process.env */,
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AppModule {}
