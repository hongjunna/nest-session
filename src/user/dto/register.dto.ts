import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { UserType } from '../type/user.type';
import { UserEnum } from '../type/user.enum';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(UserEnum)
  userType: UserType;
}
