import { IsArray, IsString } from 'class-validator';

export class AdminAuthDto {
  @IsString()
  readonly login: string;

  @IsString()
  readonly password: string;
}

export class CreateUsersDto {
  @IsString()
  readonly login: string;

  @IsString()
  readonly email: string;
}

// export class CreateUsersDto {
//   @IsArray()
//   users: CreateUsersModel[];
// }
