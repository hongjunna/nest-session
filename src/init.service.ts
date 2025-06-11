import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class InitService implements OnModuleInit {
  constructor(private readonly dataSource: DataSource) {}
  async onModuleInit() {
    await this.initDatabaseCheck();
    console.log('NestJS application has been initialized successfully!');
  }

  async initDatabaseCheck() {
    if (this.dataSource.isInitialized) {
      console.log('Database connection has been initialized successfully!');
    } else {
      console.log('Failing to initialize database connection.');
    }
  }
}
