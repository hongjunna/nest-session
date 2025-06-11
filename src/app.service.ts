import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { LoginDto } from './dto/login.dto';
import { RedisService } from './redis/redis.service';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Howzit my friend! Welcome to the NestJS application!';
  }
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly redisSerivce: RedisService,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    try {
      const { password, ...rest } = registerDto;
      const hashedPassword = await this.hashPassword(password);
      const newUser = this.userRepository.create({
        ...rest,
        password: hashedPassword,
      });
      return await this.userRepository.save(newUser);
    } catch (error) {
      const errorCode = error.code || 'UNKNOWN_ERROR';
      if (errorCode === '23505') {
        throw new BadRequestException('Username or email already exists');
      }
      throw new InternalServerErrorException(
        `Failed to register user: ${error.message}`,
      );
    }
  }

  async hashPassword(password: string): Promise<string> {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
  }

  async login(loginData: LoginDto): Promise<any> {
    const { username, password } = loginData;
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new BadRequestException('Invalid username or password');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid username or password');
    }
    const { token, nowTime, expireTime } = await this.genSessionToken(user);
    return { user, token, nowTime, expireTime };
  }

  async genSessionToken(user) {
    const sessionValidTime = 3600; // 1 hour in seconds
    try {
      const token = crypto.randomBytes(32).toString('hex');
      const key = `session:${token}`;
      await this.redisSerivce.set(key, JSON.stringify(user), sessionValidTime);
      const nowTime = new Date();
      const expireTime = new Date(nowTime.getTime() + sessionValidTime * 1000);
      return { token, nowTime, expireTime };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to generate session token',
      );
    }
  }
}
