import { Component, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExpenseService } from '../../services/expense.service';
import { CurrencyFormatPipe } from '../../pipes/currency-format.pipe';
import { CategoryBadgeComponent } from '../category-badge/category-badge';
import { CATEGORIES, ExpenseCategory } from '../../models/expense.model';

@Component({
  selector: 'app-expenses',
  imports: [CurrencyFormatPipe, CategoryBadgeComponent, RouterLink, FormsModule, DatePipe],
  templateUrl: './expenses.html',
  styleUrl: './expenses.scss',
})
export class ExpensesComponent {
  protected readonly expenseService = inject(ExpenseService);
  protected readonly categories = CATEGORIES;
  protected readonly searchTerm = signal('');
  protected readonly filterCategory = signal<ExpenseCategory | ''>('');
  protected readonly sortBy = signal<'date' | 'amount'>('date');

  protected readonly filteredExpenses = computed(() => {
    const group = this.expenseService.activeGroup();
    if (!group) return [];

    let expenses = [...group.expenses];
    const search = this.searchTerm().toLowerCase();
    const category = this.filterCategory();

    if (search) {
      expenses = expenses.filter(
        (e) =>
          e.title.toLowerCase().includes(search) ||
          e.paidBy.toLowerCase().includes(search)
      );
    }

    if (category) {
      expenses = expenses.filter((e) => e.category === category);
    }

    if (this.sortBy() === 'date') {
      expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else {
      expenses.sort((a, b) => b.amount - a.amount);
    }

    return expenses;
  });

  protected readonly filteredTotal = computed(() =>
    this.filteredExpenses().reduce((sum, e) => sum + e.amount, 0)
  );

  updateSearch(value: string): void {
    this.searchTerm.set(value);
  }

  updateFilter(value: string): void {
    this.filterCategory.set(value as ExpenseCategory | '');
  }

  updateSort(value: string): void {
    this.sortBy.set(value as 'date' | 'amount');
  }

  deleteExpense(id: string): void {
    this.expenseService.deleteExpense(id);
  }
}
