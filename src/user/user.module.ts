import { Module } from '@nestjs/common';
import UserController from './user.controller';
import { UserService } from './user.service';
import { RedisService } from 'src/redis/redis.service';
import { CustomError } from 'src/global-service/custom-error.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Module({
  controllers: [UserController],
  providers: [UserService, RedisService, CustomError],
  imports: [TypeOrmModule.forFeature([User])],
  exports: [UserService],
})
export class UserModule {}
