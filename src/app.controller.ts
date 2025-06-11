import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserService } from './user.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly userService: UserService,
  ) {}

  @Get()
  welcome(): string {
    return this.appService.getHello();
  }

  @Post('api/register')
  async registerUser(@Body() userData: RegisterDto) {
    const user = await this.userService.register(userData);
    return {
      message: `User ${user.username} registered successfully!`,
      id: user.id,
    };
  }

  @Post('api/login')
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
