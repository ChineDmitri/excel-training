import { AdminService } from './admin.service';

import { Body, Controller, Post } from '@nestjs/common';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  login(@Body() admin: any): any {
    const test = this.adminService.getHashPassword(admin.password);

    const res = test
      .then((data) => {
        return data;
      })
      .then((res) => console.log(res));
  }
}
