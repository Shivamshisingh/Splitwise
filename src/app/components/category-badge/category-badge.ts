import { Component, Input } from '@angular/core';
import { CATEGORIES, ExpenseCategory } from '../../models/expense.model';

@Component({
  selector: 'app-category-badge',
  template: `
    <span class="badge" [style.background]="bgColor" [style.color]="textColor">
      <span class="icon">{{ icon }}</span>
      <span class="label">{{ label }}</span>
    </span>
  `,
  styles: [
    `
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 500;
      }
      .icon {
        font-size: 0.9rem;
      }
    `,
  ],
})
export class CategoryBadgeComponent {
  @Input({ required: true }) category!: ExpenseCategory;

  get info() {
    return CATEGORIES.find((c) => c.key === this.category);
  }
  get icon() {
    return this.info?.icon ?? '📦';
  }
  get label() {
    return this.info?.label ?? 'Other';
  }
  get bgColor() {
    return (this.info?.color ?? '#6b7280') + '22';
  }
  get textColor() {
    return this.info?.color ?? '#6b7280';
  }
}
