import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/guard/auth.guard';

@Controller('/api/simple')
export class SimpleController {
  @UseGuards(AuthGuard)
  @Get('hello')
  getHello(): string {
    return '로그인을 하고 들어오셨군요!';
  }

  @UseGuards(AuthGuard)
  @Get('my-info')
  getMyInfo(@Req() req: Request): string {
    const user = req['user'];
    const { password, sessionToken, ...retrunUserData } = user;
    return retrunUserData;
  }
}
