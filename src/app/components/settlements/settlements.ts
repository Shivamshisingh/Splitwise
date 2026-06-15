import { Component, inject, signal } from '@angular/core';
import { ExpenseService } from '../../services/expense.service';
import { CurrencyFormatPipe } from '../../pipes/currency-format.pipe';

@Component({
  selector: 'app-settlements',
  imports: [CurrencyFormatPipe],
  templateUrl: './settlements.html',
  styleUrl: './settlements.scss',
})
export class SettlementsComponent {
  protected readonly expenseService = inject(ExpenseService);
  protected readonly settledItems = signal<Set<string>>(new Set());

  toggleSettle(key: string): void {
    this.settledItems.update((s) => {
      const next = new Set(s);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  isSettled(from: string, to: string): boolean {
    return this.settledItems().has(`${from}->${to}`);
  }

  get totalOwed(): number {
    return this.expenseService.balances().reduce((sum, b) => sum + b.amount, 0);
  }
}
