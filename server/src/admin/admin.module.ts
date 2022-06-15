import { Module } from '@nestjs/common';

import { AdminController } from './admin.controller';
import { AdminQuery } from '../database/admin.query';
import { AdminService } from './admin.service';
import { AdminFirebase } from '../firebase/admin.firebase';

@Module({
  controllers: [AdminController],
  providers: [AdminService, AdminQuery, AdminFirebase],
  exports: [AdminQuery, AdminFirebase],
})
export class AdminModule {}
