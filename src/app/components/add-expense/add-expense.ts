import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ExpenseService } from '../../services/expense.service';
import { CATEGORIES, ExpenseCategory } from '../../models/expense.model';

@Component({
  selector: 'app-add-expense',
  imports: [FormsModule, RouterLink],
  templateUrl: './add-expense.html',
  styleUrl: './add-expense.scss',
})
export class AddExpenseComponent {
  private readonly expenseService = inject(ExpenseService);
  private readonly router = inject(Router);

  protected readonly categories = CATEGORIES;

  protected title = '';
  protected amount: number | null = null;
  protected category: ExpenseCategory = 'meals';
  protected paidBy = '';
  protected date = new Date().toISOString().split('T')[0];
  protected notes = '';
  protected selectedMembers: Set<string> = new Set();

  get members() {
    return this.expenseService.activeGroup()?.members ?? [];
  }

  get isValid(): boolean {
    return (
      this.title.trim().length > 0 &&
      this.amount !== null &&
      this.amount > 0 &&
      this.paidBy.length > 0 &&
      this.selectedMembers.size > 0
    );
  }

  toggleMember(name: string): void {
    if (this.selectedMembers.has(name)) {
      this.selectedMembers.delete(name);
    } else {
      this.selectedMembers.add(name);
    }
  }

  selectAll(): void {
    for (const m of this.members) {
      this.selectedMembers.add(m.name);
    }
  }

  submit(): void {
    if (!this.isValid || this.amount === null) return;

    this.expenseService.addExpense({
      title: this.title.trim(),
      amount: this.amount,
      category: this.category,
      paidBy: this.paidBy,
      splitBetween: Array.from(this.selectedMembers),
      date: this.date,
      notes: this.notes.trim() || undefined,
    });

    this.router.navigate(['/expenses']);
  }
}
