import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly redisService: RedisService) {} // Assume redisService is injected to handle Redis operations
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization'];
    if (!token || typeof token !== 'string') {
      return false;
    }

    const key = `session:token:${token}`;
    const userData = await this.redisService.get(key);

    if (!userData) {
      return false;
    }
    request['user'] = JSON.parse(userData);
    return true;
  }
}
