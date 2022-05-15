import { Module } from '@nestjs/common';

import { AdminController } from './admin.controller';
import { AdminQuery } from '../database/admin.query';
import { AdminService } from './admin.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, AdminQuery],
  exports: [AdminQuery],
})
export class AdminModule {}
