import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

export interface OrderData {
  currencyCode: string;
  paymentMethodCode: string;
  providerCode: string;
  amount: string;
}

export interface Transaction {
  _id: string;
  orderId: string;
  externalUserId: string;
  externalOrderId: string;
  providerCode: string;
  currencyFrom: string;
  currencyTo: string;
  amountFrom: string;
  country: string;
  state?: string;
  ip?: string;
  walletAddress: string;
  walletExtraId?: string;
  paymentMethod: string;
  userAgent?: string;
  metadata?: any;
  redirectUrl?: string;
  status: string;
  errorType?: string;
  errorMessage?: string;
  errorDetails?: any[];
  transactionHash?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFilters {
  page: number;
  limit: number;
  status?: string;
  currencyFrom?: string;
  providerCode?: string;
}

export interface TransactionResponse {
  success: boolean;
  data: {
    transactions: Transaction[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      limit: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface SingleTransactionResponse {
  success: boolean;
  data: Transaction;
}

@Injectable({
  providedIn: 'root'
})
export class CurrenciesService {
  private apiUrl = 'http://localhost:3000/currencies';

  constructor(private http: HttpClient) { }

  getCurrencies(): Observable<Currency[]> {
    return this.http.get<Currency[]>(`${this.apiUrl}`);
  }

  getPaymentMethods(): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>(`${this.apiUrl}/payment-methods`);
  }

  createOrder(orderData: OrderData): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-order`, orderData);
  }

  getTransactions(filters: TransactionFilters): Observable<TransactionResponse> {
    let params = `?page=${filters.page}&limit=${filters.limit}`;
    
    if (filters.status) {
      params += `&status=${filters.status}`;
    }
    
    if (filters.currencyFrom) {
      params += `&currencyFrom=${filters.currencyFrom}`;
    }
    
    if (filters.providerCode) {
      params += `&providerCode=${filters.providerCode}`;
    }

    return this.http.get<TransactionResponse>(`${this.apiUrl}/transactions${params}`);
  }

  getTransactionById(orderId: string): Observable<SingleTransactionResponse> {
    return this.http.get<SingleTransactionResponse>(`${this.apiUrl}/transactions/${orderId}`);
  }
}

