import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CurrenciesModule } from './currencies/currencies.module';
import { config } from '../config.example';

@Module({
  imports: [
    MongooseModule.forRoot(config.database.mongodbUri),
    CurrenciesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
