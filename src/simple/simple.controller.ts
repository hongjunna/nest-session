import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/guard/auth.guard';

@Controller('/api/simple')
export class SimpleController {
  @UseGuards(AuthGuard)
  @Get('hello')
  getHello(): string {
    return '로그인을 하고 들어오셨군요!';
  }
}
