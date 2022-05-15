import 'dotenv/config';

import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config';

// import { configDataBase } from './database/config';
import { AuthAdminMiddleware } from './admin/auth-admin.middleware';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [AdminModule],
  // controllers: [AdminController],
  // providers: [AdminService, AdminQuery],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthAdminMiddleware)
      .exclude({ path: 'api/admin/login', method: RequestMethod.POST })
      .forRoutes('admin');
  }
}
