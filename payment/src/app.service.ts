import { Injectable } from '@nestjs/common';
import { getCurrencies } from './changelly/changelly.service';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async getCurrenciesList() {
    return await getCurrencies();
  }
}