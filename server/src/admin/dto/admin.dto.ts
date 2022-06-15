import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class AdminAuthDto {
  @IsString()
  readonly login: string;

  @IsString()
  password: string;
}

/* CLASSE FOR CreateNewUsersDto */
export class NewUser {
  @IsString()
  readonly login: string;

  @IsEmail()
  readonly email: string;
}

export class CreateUsersDto {
  @IsArray()
  @ValidateNested({ each: true }) //Validate for each, authorised only login and email
  @Type(() => NewUser)
  readonly users: NewUser[];
}

export class CreateQuestionDto {
  @IsString()
  readonly question: string;

  @IsString()
  readonly response1: string;

  @IsString()
  readonly response2: string;
}

export class NewPasswordDto {
  @IsString()
  readonly oldPassword: string;

  @IsString()
  readonly newPassword_1: string;

  @IsString()
  readonly newPassword_2: string;
}
