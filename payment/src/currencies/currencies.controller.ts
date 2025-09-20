import { Controller, Get, Post, Body, Param, HttpException, HttpStatus, Query } from '@nestjs/common';
import { CurrenciesService, Currency, PaymentMethod } from './currencies.service';

interface CreateOrderDto {
  currencyCode: string;
  paymentMethodCode: string;
  providerCode: string;
  amount: string;
}

interface CallbackDto {
  orderId: string;
  status: string;
  transactionHash?: string;
  completedAt?: string;
  additionalData?: any;
}

@Controller('currencies')
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Get()
  async getCurrencies(): Promise<Currency[]> {
    try {
      return await this.currenciesService.getCurrencies();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch currencies',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('payment-methods')
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      return await this.currenciesService.getPaymentMethods();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch payment methods',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('create-order')
  async createOrder(@Body() createOrderDto: CreateOrderDto): Promise<any> {
    try {
      return await this.currenciesService.createOrder(createOrderDto);
    } catch (error) {
      throw new HttpException(
        'Failed to create order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('callback')
  async handleCallback(@Body() callbackDto: CallbackDto): Promise<any> {
    try {
      this.currenciesService.logInfo('Received callback from Changelly:', callbackDto);
      return await this.currenciesService.updateTransactionStatus(callbackDto.orderId, {
        status: callbackDto.status,
        additionalData: {
          transactionHash: callbackDto.transactionHash,
          completedAt: callbackDto.completedAt,
          ...callbackDto.additionalData
        }
      });
    } catch (error) {
      this.currenciesService.logError('Error handling callback:', error);
      throw new HttpException(
        'Failed to process callback',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('transactions')
  async getTransactions(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: string,
    @Query('currencyFrom') currencyFrom?: string,
    @Query('providerCode') providerCode?: string
  ): Promise<any> {
    try {
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      
      return await this.currenciesService.getTransactions({
        page: pageNum,
        limit: limitNum,
        status,
        currencyFrom,
        providerCode
      });
    } catch (error) {
      throw new HttpException(
        'Failed to fetch transactions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('transactions/:orderId')
  async getTransactionById(@Param('orderId') orderId: string): Promise<any> {
    try {
      return await this.currenciesService.getTransactionById(orderId);
    } catch (error) {
      throw new HttpException(
        'Failed to fetch transaction',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('type/:type')
  async getCurrenciesByType(@Param('type') type: string): Promise<Currency[]> {
    try {
      if (type !== 'fiat' && type !== 'crypto') {
        throw new HttpException(
          'Invalid currency type. Must be "fiat" or "crypto"',
          HttpStatus.BAD_REQUEST,
        );
      }
      return await this.currenciesService.getCurrenciesByType(type as 'fiat' | 'crypto');
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch currencies by type',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('ticker/:ticker')
  async getCurrencyByTicker(@Param('ticker') ticker: string): Promise<Currency | null> {
    try {
      return await this.currenciesService.getCurrencyByTicker(ticker.toUpperCase());
    } catch (error) {
      throw new HttpException(
        'Failed to fetch currency by ticker',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

