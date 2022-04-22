import { IsString } from 'class-validator';

export class AdminAuthDto {
  @IsString()
  readonly login: string;

  @IsString()
  readonly password: string;
}
