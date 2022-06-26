import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
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
  readonly description: string;

  @IsString()
  readonly response1: string;

  @IsBoolean()
  readonly isResponse1: boolean;

  @IsString()
  readonly response2: string;

  @IsBoolean()
  readonly isResponse2: boolean;

  @IsString()
  readonly response3: string;

  @IsBoolean()
  readonly isResponse3: boolean;

  @IsString()
  readonly response4: string;

  @IsBoolean()
  readonly isResponse4: boolean;

  @IsString()
  readonly response5: string;

  @IsBoolean()
  readonly isResponse5: boolean;

  @IsString()
  readonly goodResponse: string;

  @IsString()
  readonly videoResponse: string;
}

export class NewPasswordDto {
  @IsString()
  readonly oldPassword: string;

  @IsString()
  readonly newPassword_1: string;

  @IsString()
  readonly newPassword_2: string;
}
