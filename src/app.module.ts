import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService, UserService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InitService } from './init.service';
import { User } from './entities/user.entity';
import { RedisService } from './redis/redis.service';

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
  providers: [AppService, InitService, UserService, RedisService],
})
export class AppModule {}
