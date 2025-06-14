import { Body, Controller, Post } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UserService } from './user.service';
import { LoginDto } from './dto/login.dto';

@Controller('/api/user')
export default class UserController {
  constructor(private readonly userService: UserService) {}
  @Post('register')
  async registerUser(@Body() userData: RegisterDto) {
    const user = await this.userService.register(userData);
    return {
      message: `User ${user.username} registered successfully!`,
      id: user.id,
    };
  }

  @Post('login')
  async loginUser(@Body() loginData: LoginDto) {
    const { userName, token, nowTime, expireTime } =
      await this.userService.login(loginData);
    return {
      message: `User ${userName} login successfully!`,
      userName,
      token,
      nowTime,
      expireTime,
    };
  }
}
