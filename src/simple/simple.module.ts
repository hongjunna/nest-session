import { Module } from '@nestjs/common';
import { SimpleController } from './simple.controller';

@Module({
  controllers: [SimpleController]
})
export class SimpleModule {}
