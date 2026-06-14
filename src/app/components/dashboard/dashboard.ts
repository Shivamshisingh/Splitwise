import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ExpenseService } from '../../services/expense.service';
import { CurrencyFormatPipe } from '../../pipes/currency-format.pipe';
import { CategoryBadgeComponent } from '../category-badge/category-badge';

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyFormatPipe, CategoryBadgeComponent, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent {
  protected readonly expenseService = inject(ExpenseService);

  get maxCategoryAmount(): number {
    const breakdown = this.expenseService.categoryBreakdown();
    return breakdown.length > 0 ? Math.max(...breakdown.map((c) => c.amount)) : 1;
  }

  get maxMonthlyAmount(): number {
    const trend = this.expenseService.monthlyTrend();
    return trend.length > 0 ? Math.max(...trend.map((t) => t.amount)) : 1;
  }
}
