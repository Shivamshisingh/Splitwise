import { Component, inject, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ExpenseService } from '../../services/expense.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent {
  protected readonly expenseService = inject(ExpenseService);
  readonly sidebarToggle = output<void>();

  readonly navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'grid_view' },
    { path: '/expenses', label: 'Expenses', icon: 'receipt_long' },
    { path: '/add', label: 'Add Expense', icon: 'add_circle' },
    { path: '/groups', label: 'Groups', icon: 'group' },
    { path: '/settlements', label: 'Settlements', icon: 'handshake' },
    { path: '/reports', label: 'Reports', icon: 'bar_chart' },
  ];

  selectGroup(groupId: string): void {
    this.expenseService.setActiveGroup(groupId);
  }
}
