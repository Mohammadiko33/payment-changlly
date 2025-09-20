import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CurrenciesComponent } from './components/currencies/currencies.component';
import { TransactionsComponent } from './components/transactions/transactions.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule, CurrenciesComponent, TransactionsComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Changelly Currency Selector');
  protected readonly activeTab = signal<'currencies' | 'transactions'>('currencies');

  setActiveTab(tab: 'currencies' | 'transactions'): void {
    this.activeTab.set(tab);
  }
}
