import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './services/user/entities/user.entity';
import { InitService } from './services/global/init.service';
import { UserService } from './services/user/user.service';
import { RedisService } from './services/redis/redis.service';
import { CustomError } from './services/global/custom-error.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Set to false in production
    }),
    TypeOrmModule.forFeature([User]), // Add your entities here
  ],
  controllers: [AppController],
  providers: [AppService, InitService, UserService, RedisService, CustomError],
})
export class AppModule {}
