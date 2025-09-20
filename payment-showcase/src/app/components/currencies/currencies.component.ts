import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CurrenciesService, Currency, PaymentMethod } from '../../services/currencies.service';

interface Provider {
  providerCode: string;
  supportedFlows: string[];
  limits: any;
}

@Component({
  selector: 'app-currencies',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './currencies.component.html',
  styleUrls: ['./currencies.component.css']
})
export class CurrenciesComponent implements OnInit {
  currencies: Currency[] = [];
  paymentMethods: PaymentMethod[] = [];
  selectedCurrency: string = '';
  selectedProvider: string = '';
  selectedPaymentMethod: string = '';
  amount: string = '';
  availableProviders: Provider[] = [];
  loading: boolean = false;
  processing: boolean = false;
  error: string = '';

  constructor(private currenciesService: CurrenciesService) {}

  ngOnInit(): void {
    this.loadCurrencies();
    this.loadPaymentMethods();
  }

  loadCurrencies(): void {
    this.loading = true;
    this.error = '';

    this.currenciesService.getCurrencies().subscribe({
      next: (data) => {
        this.currencies = data;
        console.log('=== CURRENCIES DATA ===');
        console.log('Total currencies loaded:', this.currencies.length);
        console.log('Currencies with providers:', this.currencies);
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load currencies. Please try again later.';
        this.loading = false;
        console.error('Error loading currencies:', error);
      }
    });
  }

  loadPaymentMethods(): void {
    this.currenciesService.getPaymentMethods().subscribe({
      next: (data) => {
        this.paymentMethods = data;
        console.log('=== PAYMENT METHODS DATA ===');
        console.log('Total payment methods loaded:', this.paymentMethods.length);
        console.log('Payment methods:', this.paymentMethods);
        console.table(this.paymentMethods);
      },
      error: (error) => {
        console.error('Error loading payment methods:', error);
      }
    });
  }

  onCurrencyChange(): void {
    console.log('=== CURRENCY SELECTION ===');
    console.log('Selected currency:', this.selectedCurrency);
    this.selectedProvider = ''; // Reset provider selection
    this.selectedPaymentMethod = ''; // Reset payment method selection
    this.amount = ''; // Reset amount
    
    if (this.selectedCurrency) {
      const currency = this.getSelectedCurrencyDetails();
      if (currency) {
        console.log('Selected currency details:', currency);
        console.log('Currency providers (before filtering):', currency.providers);
        
        // Filter providers to only include those with "sell" in supportedFlows
        this.availableProviders = (currency.providers || []).filter(provider => 
          provider.supportedFlows && 
          provider.supportedFlows.includes('sell')
        );
        
        console.log('=== PROVIDER DATA ===');
        console.log('Available providers with sell flow:', this.availableProviders.length);
        console.log('Filtered providers:', this.availableProviders);
        console.table(this.availableProviders);
      }
    } else {
      this.availableProviders = [];
      console.log('No currency selected, providers cleared');
    }
  }

  onProviderChange(): void {
    console.log('=== PROVIDER SELECTION ===');
    console.log('Selected provider:', this.selectedProvider);
    this.selectedPaymentMethod = ''; // Reset payment method selection
    this.amount = ''; // Reset amount
    
    if (this.selectedProvider) {
      const provider = this.getSelectedProviderDetails();
      if (provider) {
        console.log('Selected provider details:', provider);
        console.log('Provider supported flows:', provider.supportedFlows);
        console.log('Provider limits:', provider.limits);
      }
    }
  }

  onPaymentMethodChange(): void {
    console.log('=== PAYMENT METHOD SELECTION ===');
    console.log('Selected payment method:', this.selectedPaymentMethod);
    this.amount = ''; // Reset amount
    
    if (this.selectedPaymentMethod) {
      const paymentMethod = this.getSelectedPaymentMethodDetails();
      if (paymentMethod) {
        console.log('Selected payment method details:', paymentMethod);
        console.log('Payment method parameter value:', paymentMethod.parameterValue);
        console.log('Payment method description:', paymentMethod.description);
      }
    }
  }

  onAmountChange(): void {
    console.log('=== AMOUNT ENTRY ===');
    console.log('Amount entered:', this.amount);
  }

  processOrder(): void {
    if (!this.isSelectionComplete() || !this.amount) {
      this.error = 'Please complete all selections and enter an amount.';
      return;
    }

    this.processing = true;
    this.error = '';

    const orderData = {
      currencyCode: this.selectedCurrency,
      paymentMethodCode: this.selectedPaymentMethod,
      providerCode: this.selectedProvider,
      amount: this.amount
    };

    console.log('=== ORDER PROCESSING ===');
    console.log('Processing order with data:', orderData);
    console.log('Selected currency details:', this.getSelectedCurrencyDetails());
    console.log('Selected provider details:', this.getSelectedProviderDetails());
    console.log('Selected payment method details:', this.getSelectedPaymentMethodDetails());

    this.currenciesService.createOrder(orderData).subscribe({
      next: (response) => {
        console.log('=== ORDER RESPONSE ===');
        console.log('Order response received:', response);
        
        if (response.success && response.redirectUrl) {
          console.log('=== ORDER SUCCESS - REDIRECTING ===');
          console.log('Redirecting to:', response.redirectUrl);
          this.processing = false;
          
          // Redirect to the provided URL
          window.location.href = response.redirectUrl;
        } else if (response.success) {
          console.log('=== ORDER SUCCESS ===');
          console.log('Order created successfully:', response.orderDetails);
          this.processing = false;
          // You can add success handling here (e.g., show success message)
        } else {
          console.error('=== ORDER FAILED ===');
          console.error('Order creation failed:', response.error);
          
          // Display detailed error message from Changelly
          let errorMessage = 'Order creation failed';
          
          if (response.error) {
            if (response.error.type && response.error.message) {
              errorMessage = `${response.error.type.toUpperCase()}: ${response.error.message}`;
            } else if (response.error.message) {
              errorMessage = response.error.message;
            }
            
            // Add error details if available
            if (response.error.details) {
              if (Array.isArray(response.error.details)) {
                const details = response.error.details.map((detail: any) => {
                  if (typeof detail === 'object' && detail.cause && detail.value) {
                    return `${detail.cause}: ${detail.value}`;
                  }
                  return detail;
                }).join(', ');
                if (details) {
                  errorMessage += ` (${details})`;
                }
              } else {
                errorMessage += ` (${response.error.details})`;
              }
            }
          }
          
          this.error = errorMessage;
          this.processing = false;
        }
      },
      error: (error) => {
        console.error('=== ORDER ERROR ===');
        console.error('Error creating order:', error);
        
        // Handle HTTP error responses
        let errorMessage = 'Failed to create order. Please try again.';
        
        if (error.error && error.error.error) {
          const changellyError = error.error.error;
          if (changellyError.type && changellyError.message) {
            errorMessage = `${changellyError.type.toUpperCase()}: ${changellyError.message}`;
          } else if (changellyError.message) {
            errorMessage = changellyError.message;
          }
          
          // Add error details if available
          if (changellyError.details) {
            if (Array.isArray(changellyError.details)) {
              const details = changellyError.details.map((detail: any) => {
                if (typeof detail === 'object' && detail.cause && detail.value) {
                  return `${detail.cause}: ${detail.value}`;
                }
                return detail;
              }).join(', ');
              if (details) {
                errorMessage += ` (${details})`;
              }
            } else {
              errorMessage += ` (${changellyError.details})`;
            }
          }
        }
        
        this.error = errorMessage;
        this.processing = false;
      }
    });
  }

  getSelectedCurrencyDetails(): Currency | undefined {
    return this.currencies.find(currency => currency.ticker === this.selectedCurrency);
  }

  getSelectedProviderDetails(): Provider | undefined {
    return this.availableProviders.find(provider => provider.providerCode === this.selectedProvider);
  }

  getSelectedPaymentMethodDetails(): PaymentMethod | undefined {
    return this.paymentMethods.find(method => method.parameterValue === this.selectedPaymentMethod);
  }

  getProviderDisplayName(provider: Provider): string {
    return `${provider.providerCode.toUpperCase()} (${provider.supportedFlows.join(', ')})`;
  }

  getSupportedFlowsString(): string {
    const provider = this.getSelectedProviderDetails();
    return provider?.supportedFlows?.join(', ') || '';
  }

  // Method to get the selected provider code for API calls
  getSelectedProviderCode(): string {
    return this.selectedProvider;
  }

  // Method to get the selected payment method for API calls
  getSelectedPaymentMethodCode(): string {
    return this.selectedPaymentMethod;
  }

  // Method to get complete selection data for API calls
  getSelectionData(): { currency: string; provider: string; paymentMethod: string; amount: string } | null {
    if (this.selectedCurrency && this.selectedProvider && this.selectedPaymentMethod && this.amount) {
      return {
        currency: this.selectedCurrency,
        provider: this.selectedProvider,
        paymentMethod: this.selectedPaymentMethod,
        amount: this.amount
      };
    }
    return null;
  }

  // Method to check if all selections are complete
  isSelectionComplete(): boolean {
    return !!(this.selectedCurrency && this.selectedProvider && this.selectedPaymentMethod);
  }

  // Method to check if form is ready for processing
  isFormReady(): boolean {
    return this.isSelectionComplete() && !!this.amount;
  }

  // Method to clear error messages
  clearError(): void {
    this.error = '';
  }
}
