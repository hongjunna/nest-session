import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { LoginDto } from './dto/login.dto';
import { RedisService } from '../redis/redis.service';
import { CustomError } from '../global/custom-error.service';

@Injectable()
export class UserService {
  private readonly logger: Logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly redisSerivce: RedisService,
    private readonly customError: CustomError,
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
      this.determineRegisterErrorCode(error);
    }
  }

  private determineRegisterErrorCode(error: any): never {
    // 여기는 에러 처리만 담당하는 곳입니다. 에러는 return 하지 말고 반드시 throw로 처리하도록 합니다.
    const errorCode = error.code || 'UNKNOWN_ERROR';
    if (errorCode === '23505') {
      throw new BadRequestException('Username or email already exists');
    }
    this.logger.error(`Failed to register user: ${error.message}`, error.stack);
    throw this.customError.internalserverException('회원가입');
  }

  private async hashPassword(password: string): Promise<string> {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
  }

  async login(loginData: LoginDto): Promise<any> {
    const { username, password } = loginData;
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new BadRequestException('등록되지 않은 username 입니다.');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException(
        'username 또는 password가 일치하지 않습니다.',
      );
    }
    const { token, nowTime, expireTime } = await this.genSessionToken(user);
    const userName = user.username;
    return { userName, token, nowTime, expireTime };
  }

  private async genSessionToken(user: User) {
    try {
      const sessionValidTime = 3600;
      const token = crypto.randomBytes(32).toString('hex');
      const key = `session:${token}`;
      this.setSessionTokentoRedis(key, user, sessionValidTime);
      const nowTime = new Date();
      const expireTime = new Date(nowTime.getTime() + sessionValidTime * 1000);
      return { token, nowTime, expireTime };
    } catch (error) {
      throw this.customError.internalserverException('로그인');
    }
  }

  private async setSessionTokentoRedis(
    key: string,
    user: User,
    sessionValidTime: number,
  ): Promise<void> {
    const setSessionResult = await this.redisSerivce.set(
      key,
      JSON.stringify(user),
      sessionValidTime,
    );
    if (!setSessionResult) {
      this.logger.error(
        `Failed to set session token in Redis for user ${user.username}`,
      );
      throw this.customError.internalserverException('로그인');
    }
  }
}
