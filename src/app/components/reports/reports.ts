import { Component, inject, computed } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { ExpenseService } from '../../services/expense.service';
import { CurrencyFormatPipe } from '../../pipes/currency-format.pipe';
import { CATEGORIES } from '../../models/expense.model';

@Component({
  selector: 'app-reports',
  imports: [CurrencyFormatPipe, DecimalPipe, DatePipe],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class ReportsComponent {
  protected readonly expenseService = inject(ExpenseService);

  protected readonly memberSpending = computed(() => {
    const group = this.expenseService.activeGroup();
    if (!group) return [];
    const map = new Map<string, { paid: number; owes: number }>();
    for (const m of group.members) {
      map.set(m.name, { paid: 0, owes: 0 });
    }
    for (const e of group.expenses) {
      const entry = map.get(e.paidBy);
      if (entry) entry.paid += e.amount;
      const share = e.amount / e.splitBetween.length;
      for (const person of e.splitBetween) {
        const pEntry = map.get(person);
        if (pEntry) pEntry.owes += share;
      }
    }
    return Array.from(map.entries()).map(([name, data]) => ({
      name,
      paid: data.paid,
      owes: Math.round(data.owes * 100) / 100,
      net: Math.round((data.paid - data.owes) * 100) / 100,
    }));
  });

  protected readonly topExpenses = computed(() => {
    const group = this.expenseService.activeGroup();
    if (!group) return [];
    return [...group.expenses].sort((a, b) => b.amount - a.amount).slice(0, 5);
  });

  protected readonly avgExpense = computed(() => {
    const group = this.expenseService.activeGroup();
    if (!group || group.expenses.length === 0) return 0;
    return Math.round(
      group.expenses.reduce((s, e) => s + e.amount, 0) / group.expenses.length
    );
  });

  get maxPaid(): number {
    const members = this.memberSpending();
    return members.length > 0 ? Math.max(...members.map((m) => m.paid)) : 1;
  }

  get maxCategoryAmount(): number {
    const breakdown = this.expenseService.categoryBreakdown();
    return breakdown.length > 0 ? Math.max(...breakdown.map((c) => c.amount)) : 1;
  }

  get maxMonthlyAmount(): number {
    const trend = this.expenseService.monthlyTrend();
    return trend.length > 0 ? Math.max(...trend.map((t) => t.amount)) : 1;
  }

  getCategoryInfo(key: string) {
    return CATEGORIES.find((c) => c.key === key);
  }

  getOffset(index: number): number {
    const breakdown = this.expenseService.categoryBreakdown();
    let offset = 125.5; // Start at top (90 degrees -> 502 * 0.25)
    for (let i = 0; i < index; i++) {
      offset -= breakdown[i].percentage * 5.02;
    }
    return offset;
  }
}
