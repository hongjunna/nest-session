import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { UserEnum } from 'src/type/user.enum';
import { UserType } from 'src/type/user.type';

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
