import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  onModuleInit() {
    this.client = new Redis({
      host: 'localhost',
      port: 6379,
    });

    this.client.on('connect', () => console.log('Redis connected!'));
    this.client.on('error', (err) => console.error('Redis Error:', err));
  }

  onModuleDestroy() {
    this.client.quit();
  }

  async set(key: string, value: string, p0?: number) {
    if (p0 !== undefined) {
      await this.client.set(key, value, 'EX', p0);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string) {
    return await this.client.get(key);
  }

  async del(key: string) {
    await this.client.del(key);
  }
}
