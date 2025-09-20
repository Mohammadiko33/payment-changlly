import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ChangellyCurrency,
  ChangellyFiatClient,
} from '@changelly/fiat-api-sdk-node';
import { config } from '../../config.example';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';

export interface Currency {
  type: 'fiat' | 'crypto';
  ticker: string;
  name: string;
  iconUrl: string;
  iconColoredUrl: string;
  precision: string;
  network?: string;
  protocol?: string;
  extraIdName?: string | null;
  providers: any[];
}

export interface PaymentMethod {
  parameterValue: string;
  description: string;
}

interface CreateOrderDto {
  currencyCode: string;
  paymentMethodCode: string;
  providerCode: string;
  amount: string;
}

@Injectable()
export class CurrenciesService {
  private readonly logger = new Logger(CurrenciesService.name);
  private client: ChangellyFiatClient;

  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
  ) {
    // Initialize Changelly client with config values
    this.client = new ChangellyFiatClient({
      privateKey: Buffer.from(config.changelly.privateKey, 'base64').toString(
        'utf-8',
      ),
      publicKey: config.changelly.publicKey,
    });
  }

  // Payment methods data
  private readonly paymentMethods: PaymentMethod[] = [
    {
      parameterValue: 'card',
      description: 'Card payments, e.g. Visa/Mastercard',
    },
    { parameterValue: 'IDEAL', description: 'iDEAL' },
    { parameterValue: 'gbp_bank_transfer', description: 'UKFP' },
    { parameterValue: 'sepa_bank_transfer', description: 'SEPA' },
    { parameterValue: 'apple_pay', description: 'Apple Pay / Google Pay' },
    {
      parameterValue: 'yellow_card_bank_transfer',
      description: 'Local bank transfer',
    },
    { parameterValue: 'pix', description: 'PIX' },
    { parameterValue: 'pay_id', description: 'PayID' },
    { parameterValue: 'pay_pal', description: 'PayPal' },
    { parameterValue: 'skrill', description: 'Skrill Balance' },
    { parameterValue: 'spei', description: 'SPEI' },
    { parameterValue: 'oxxo', description: 'Oxxo' },
    { parameterValue: 'astro_pay', description: 'AstroPay' },
    { parameterValue: 'ach', description: 'ACH' },
  ];

  async getCurrencies(): Promise<Currency[]> {
    try {
      // Get available currencies from Changelly
      const currencies = await this.client.getCurrencyList({
        type: ChangellyCurrency.Fiat,
      });

      // Transform the response to match our interface
      const transformedCurrencies: Currency[] = currencies.map(
        (currency: any) => ({
          type: currency.type,
          ticker: currency.ticker,
          name: currency.name,
          iconUrl: currency.iconUrl,
          iconColoredUrl: currency.iconColoredUrl,
          precision: currency.precision,
          network: currency.network,
          protocol: currency.protocol,
          extraIdName: currency.extraIdName,
          providers: currency.providers || [],
        }),
      );

      // Filter currencies that have providers with "sell" in supportedFlows
      const currenciesWithSellFlow = transformedCurrencies.filter(
        (currency) => {
          return currency.providers.some(
            (provider) =>
              provider.supportedFlows &&
              provider.supportedFlows.includes('sell'),
          );
        },
      );

      return currenciesWithSellFlow;
    } catch (error) {
      this.logger.error('Error fetching currencies from Changelly API', error);

      // Return a fallback list of common currencies if API fails
      return this.getFallbackCurrencies();
    }
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return this.paymentMethods;
  }

  async createOrder(createOrderDto: CreateOrderDto): Promise<any> {
    try {
      // Merge frontend parameters with required Changelly order data
      const orderData = {
        returnSuccessUrl: 'http://helloworkd.com/',
        returnFailedUrl: 'http://helloworkd.com/',
        orderId: '5154302e-3stl-75p4',
        externalUserId: '122hd',
        externalOrderId: '71ahw34',
        providerCode: createOrderDto.providerCode as any, // Cast to any to handle provider code
        currencyFrom: createOrderDto.currencyCode,
        currencyTo: 'USDTRX', // You might want to make this configurable
        amountFrom: `${createOrderDto.amount}`,
        country: 'PH',
        state: undefined,
        ip: undefined,
        walletAddress: config.changelly.walletAddress,
        walletExtraId: undefined,
        paymentMethod: createOrderDto.paymentMethodCode as any, // Cast to any to handle payment method
        userAgent: undefined,
        metadata: undefined,
      };

      // Call Changelly createOrder method
      const result = (await this.client.createOrder(orderData)) as any;
      console.log('==========orderData==========');
      console.log(orderData);
      console.log('==========result==========');
      console.log(result);

      // Save transaction to database
      await this.saveTransaction(orderData, result);

      // Check if the response contains an error
      if (result.errorType) {
        return {
          success: false,
          error: {
            type: result.errorType,
            message: result.errorMessage,
            details: result.errorDetails,
          },
        };
      }

      // If successful, return the redirect URL
      if (result.redirectUrl) {
        return {
          success: true,
          redirectUrl: result.redirectUrl,
          orderDetails: result,
        };
      }

      // Fallback response
      return {
        success: true,
        orderDetails: result,
      };
    } catch (error) {
      this.logger.error('Error creating order:', error);

      // Handle specific Changelly API errors
      if (error.response && error.response.data) {
        return {
          success: false,
          error: {
            type: error.response.data.errorType || 'api_error',
            message: error.response.data.errorMessage || 'API request failed',
            details: error.response.data.errorDetails || error.message,
          },
        };
      }

      return {
        success: false,
        error: {
          type: 'api_error',
          message: 'Failed to create order',
          details: error.message || 'Unknown error occurred',
        },
      };
    }
  }

  private async saveTransaction(orderData: any, result: any): Promise<void> {
    try {
      const transactionData = {
        orderId: orderData.orderId,
        externalUserId: orderData.externalUserId,
        externalOrderId: orderData.externalOrderId,
        providerCode: orderData.providerCode,
        currencyFrom: orderData.currencyFrom,
        currencyTo: orderData.currencyTo,
        amountFrom: orderData.amountFrom,
        country: orderData.country,
        state: orderData.state,
        ip: orderData.ip,
        walletAddress: orderData.walletAddress,
        walletExtraId: orderData.walletExtraId,
        paymentMethod: orderData.paymentMethod,
        userAgent: orderData.userAgent,
        metadata: orderData.metadata,
        redirectUrl: result.redirectUrl,
        status: result.errorType ? 'failed' : 'pending',
        errorType: result.errorType,
        errorMessage: result.errorMessage,
        errorDetails: result.errorDetails,
      };

      const transaction = new this.transactionModel(transactionData);
      await transaction.save();
    } catch (error) {
      this.logger.error('Error saving transaction to database:', error);
    }
  }

  async updateTransactionStatus(
    orderId: string,
    updateStatusDto: any,
  ): Promise<any> {
    try {
      const updateData: any = {
        status: updateStatusDto.status,
        updatedAt: new Date(),
      };

      // Add additional data if provided
      if (updateStatusDto.additionalData) {
        Object.assign(updateData, updateStatusDto.additionalData);
      }

      const updatedTransaction = await this.transactionModel.findOneAndUpdate(
        { orderId: orderId },
        updateData,
        { new: true },
      );

      if (!updatedTransaction) {
        this.logger.warn(`Transaction not found for orderId: ${orderId}`);
        return {
          success: false,
          error: {
            type: 'not_found',
            message: 'Transaction not found',
          },
        };
      }

      return {
        success: true,
        transaction: updatedTransaction,
      };
    } catch (error) {
      this.logger.error('Error updating transaction status:', error);
      return {
        success: false,
        error: {
          type: 'update_error',
          message: 'Failed to update transaction status',
          details: error.message || 'Unknown error occurred',
        },
      };
    }
  }

  // Public logging methods for controller access
  logInfo(message: string, context?: any): void {
    this.logger.log(message, context);
  }

  logError(message: string, error?: any): void {
    this.logger.error(message, error);
  }

  async getTransactions(filters: {
    page: number;
    limit: number;
    status?: string;
    currencyFrom?: string;
    providerCode?: string;
  }): Promise<any> {
    try {
      this.logger.log('Fetching transactions with filters:', filters);

      // Build query filter
      const queryFilter: any = {};

      if (filters.status) {
        queryFilter.status = filters.status;
      }

      if (filters.currencyFrom) {
        queryFilter.currencyFrom = filters.currencyFrom.toUpperCase();
      }

      if (filters.providerCode) {
        queryFilter.providerCode = filters.providerCode;
      }

      // Calculate skip for pagination
      const skip = (filters.page - 1) * filters.limit;

      // Get total count for pagination
      const totalCount =
        await this.transactionModel.countDocuments(queryFilter);

      // Get transactions with pagination and sorting (newest first)
      const transactions = await this.transactionModel
        .find(queryFilter)
        .sort({ createdAt: -1 }) // Sort by newest first
        .skip(skip)
        .limit(filters.limit)
        .lean(); // Convert to plain JavaScript objects

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / filters.limit);
      const hasNextPage = filters.page < totalPages;
      const hasPrevPage = filters.page > 1;

      this.logger.log(
        `Found ${transactions.length} transactions out of ${totalCount} total`,
      );

      return {
        success: true,
        data: {
          transactions,
          pagination: {
            currentPage: filters.page,
            totalPages,
            totalCount,
            limit: filters.limit,
            hasNextPage,
            hasPrevPage,
          },
        },
      };
    } catch (error) {
      this.logger.error('Error fetching transactions:', error);
      return {
        success: false,
        error: {
          type: 'fetch_error',
          message: 'Failed to fetch transactions',
          details: error.message || 'Unknown error occurred',
        },
      };
    }
  }

  async getTransactionById(orderId: string): Promise<any> {
    try {
      this.logger.log(`Fetching transaction by orderId: ${orderId}`);

      const transaction = await this.transactionModel
        .findOne({ orderId: orderId })
        .lean();

      if (!transaction) {
        this.logger.warn(`Transaction not found for orderId: ${orderId}`);
        return {
          success: false,
          error: {
            type: 'not_found',
            message: 'Transaction not found',
          },
        };
      }

      this.logger.log('Transaction found successfully');
      return {
        success: true,
        data: transaction,
      };
    } catch (error) {
      this.logger.error('Error fetching transaction by ID:', error);
      return {
        success: false,
        error: {
          type: 'fetch_error',
          message: 'Failed to fetch transaction',
          details: error.message || 'Unknown error occurred',
        },
      };
    }
  }

  async getCurrenciesByType(type: 'fiat' | 'crypto'): Promise<Currency[]> {
    const allCurrencies = await this.getCurrencies();
    return allCurrencies.filter((currency) => currency.type === type);
  }

  async getCurrencyByTicker(ticker: string): Promise<Currency | null> {
    const allCurrencies = await this.getCurrencies();
    return allCurrencies.find((currency) => currency.ticker === ticker) || null;
  }

  private getFallbackCurrencies(): Currency[] {
    return [
      {
        type: 'fiat',
        ticker: 'USD',
        name: 'US Dollar',
        iconUrl: 'https://cdn.changelly.com/icons/usd.svg',
        iconColoredUrl: 'https://cdn.changelly.com/icons-colored/usd.png',
        precision: '2',
        providers: [
          {
            providerCode: 'moonpay',
            supportedFlows: ['buy', 'sell'],
            limits: { send: {} },
          },
        ],
      },
      {
        type: 'fiat',
        ticker: 'EUR',
        name: 'Euro',
        iconUrl: 'https://cdn.changelly.com/icons/eur.svg',
        iconColoredUrl: 'https://cdn.changelly.com/icons-colored/eur.png',
        precision: '2',
        providers: [
          {
            providerCode: 'moonpay',
            supportedFlows: ['buy', 'sell'],
            limits: { send: {} },
          },
        ],
      },
      {
        type: 'crypto',
        ticker: 'BTC',
        name: 'Bitcoin',
        iconUrl: 'https://cdn.changelly.com/icons/btc.svg',
        iconColoredUrl: 'https://cdn.changelly.com/icons-colored/btc.png',
        precision: '8',
        network: 'bitcoin',
        protocol: 'BTC',
        extraIdName: null,
        providers: [
          {
            providerCode: 'moonpay',
            supportedFlows: ['buy', 'sell'],
            limits: { send: {} },
          },
        ],
      },
      {
        type: 'crypto',
        ticker: 'ETH',
        name: 'Ethereum',
        iconUrl: 'https://cdn.changelly.com/icons/eth.svg',
        iconColoredUrl: 'https://cdn.changelly.com/icons-colored/eth.png',
        precision: '8',
        network: 'ethereum',
        protocol: 'ETH',
        extraIdName: null,
        providers: [
          {
            providerCode: 'moonpay',
            supportedFlows: ['buy', 'sell'],
            limits: { send: {} },
          },
        ],
      },
    ];
  }
}
