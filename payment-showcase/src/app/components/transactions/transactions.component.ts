import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CurrenciesService, Transaction, TransactionFilters, TransactionResponse } from '../../services/currencies.service';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  loading = false;
  error = '';
  
  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalCount = 0;
  limit = 10;
  hasNextPage = false;
  hasPrevPage = false;

  // Filters
  filters: TransactionFilters = {
    page: 1,
    limit: 10
  };

  // Filter options
  statusFilter = '';
  currencyFilter = '';
  providerFilter = '';

  // Status options for filter
  statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'processing', label: 'Processing' }
  ];

  constructor(private currenciesService: CurrenciesService) { }

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading = true;
    this.error = '';

    // Update filters
    this.filters = {
      page: this.currentPage,
      limit: this.limit,
      status: this.statusFilter || undefined,
      currencyFrom: this.currencyFilter || undefined,
      providerCode: this.providerFilter || undefined
    };

    this.currenciesService.getTransactions(this.filters).subscribe({
      next: (response: TransactionResponse) => {
        if (response.success) {
          this.transactions = response.data.transactions;
          this.currentPage = response.data.pagination.currentPage;
          this.totalPages = response.data.pagination.totalPages;
          this.totalCount = response.data.pagination.totalCount;
          this.hasNextPage = response.data.pagination.hasNextPage;
          this.hasPrevPage = response.data.pagination.hasPrevPage;
        } else {
          this.error = 'Failed to load transactions';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.error = 'Error loading transactions';
        this.loading = false;
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadTransactions();
  }

  onFilterChange(): void {
    this.currentPage = 1; // Reset to first page when filtering
    this.loadTransactions();
  }

  clearFilters(): void {
    this.statusFilter = '';
    this.currencyFilter = '';
    this.providerFilter = '';
    this.currentPage = 1;
    this.loadTransactions();
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'status-completed';
      case 'failed':
        return 'status-failed';
      case 'pending':
        return 'status-pending';
      case 'processing':
        return 'status-processing';
      default:
        return 'status-default';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  formatAmount(amount: string): string {
    return parseFloat(amount).toFixed(2);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  viewTransactionDetails(transaction: Transaction): void {
    // For now, just log the transaction details
    // You can implement a modal or navigation to a details page later
    console.log('Transaction Details:', transaction);
    alert(`Transaction Details:\nOrder ID: ${transaction.orderId}\nStatus: ${transaction.status}\nAmount: ${transaction.amountFrom} ${transaction.currencyFrom}\nProvider: ${transaction.providerCode}`);
  }
} 