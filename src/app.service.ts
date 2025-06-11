import { Injectable } from '@nestjs/common';
@Injectable()
export class AppService {
  getHello(): string {
    return 'Howzit my friend! Welcome to the NestJS application!';
  }
}
