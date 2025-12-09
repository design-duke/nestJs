import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatsModule } from './cats/cats.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '123456',
      database: 'ceshi',
      entities: ['src/**/*.entity.ts'],
      synchronize: true,
      logging: true,
    }),
    TypeOrmModule.forFeature([CatsModule]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
