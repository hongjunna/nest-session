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
      throw this.customError.customStatusException(
        409,
        '이미 존재하는 username 입니다. 다른 username을 사용해주세요.',
      );
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
    const user = await this.getUserByUsername(username);
    await this.validatePassword(user, password);
    await this.checkUserAlreadyLoggedIn(user);
    const { token, nowTime, expireTime } = await this.issueSessionToken(user);
    const userName = user.username;
    return { userName, token, nowTime, expireTime };
  }

  private async getUserByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new BadRequestException('등록되지 않은 username 입니다.');
    }
    return user;
  }

  private async validatePassword(user: User, password: string): Promise<void> {
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException(
        'username 또는 password가 일치하지 않습니다.',
      );
    }
  }

  private async checkUserAlreadyLoggedIn(user: User): Promise<void> {
    const sessionToken = await this.getSessionTokenByUserId(user);
    if (sessionToken) {
      throw this.customError.customStatusException(
        409,
        '이미 로그인된 상태입니다. 정책상 하나의 계정당 기기에서만 로그인하실 수 있습니다. 로그아웃 후 다시 시도해주세요.',
      );
    }
  }

  private async getSessionTokenByUserId(user: User): Promise<string | null> {
    const userId = user.id;
    const key = `session:status:${userId}`;
    const userToken = await this.redisSerivce.get(key);
    if (!userToken) {
      return null;
    }
    try {
      const userInfo = JSON.parse(userToken);
      return userInfo.sessionToken;
    } catch (error) {
      this.logger.error(
        `Failed to parse user login status from Redis for user ${user.username}`,
        error,
      );
      throw new InternalServerErrorException(
        'Redis에서 사용자 로그인 상태를 가져오는 중 오류가 발생했습니다.',
      );
    }
  }

  private async issueSessionToken(user: User) {
    try {
      const sessionValidTime = 3600;
      const token = crypto.randomBytes(32).toString('hex');
      this.setSessionTokentoRedis(token, user, sessionValidTime);
      this.setUserLoginStatustoRedis(token, user, sessionValidTime);
      const nowTime = new Date();
      const expireTime = new Date(nowTime.getTime() + sessionValidTime * 1000);
      return { token, nowTime, expireTime };
    } catch (error) {
      throw this.customError.internalserverException('로그인');
    }
  }

  private async setSessionTokentoRedis(
    token: string,
    user: User,
    sessionValidTime: number,
  ): Promise<void> {
    const key = `session:token:${token}`;
    const redisUserInfo = {
      ...user,
      sessionToken: token,
    };
    const setSessionResult = await this.redisSerivce.set(
      key,
      JSON.stringify(redisUserInfo),
      sessionValidTime,
    );
    if (!setSessionResult) {
      this.logger.error(
        `Failed to set session token in Redis for user ${user.username}`,
      );
      throw this.customError.internalserverException('로그인');
    }
  }

  private async setUserLoginStatustoRedis(
    token: string,
    user: User,
    sessionValidTime: number,
  ): Promise<void> {
    const userId = user.id;
    const key = `session:status:${userId}`;
    const redisUserInfo = {
      sessionToken: token,
    };
    const setSessionResult = await this.redisSerivce.set(
      key,
      JSON.stringify(redisUserInfo),
      sessionValidTime,
    );
    if (!setSessionResult) {
      this.logger.error(
        `Failed to set user login status in Redis for user ${user.username}`,
      );
      throw this.customError.internalserverException('로그인');
    }
  }
}
