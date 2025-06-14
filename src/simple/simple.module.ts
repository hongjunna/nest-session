import { Module } from '@nestjs/common';
import { SimpleController } from './simple.controller';

@Module({
  controllers: [SimpleController],
  providers: [],
  exports: [],
})
export class SimpleModule {}
