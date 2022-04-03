import { Injectable } from '@nestjs/common';

import { hash } from 'bcrypt';

@Injectable()
export class AdminService {
  getHashPassword(password: string) {
    return new Promise((resolve) => {
      resolve(hash(password, 10));
    });
  }
}
