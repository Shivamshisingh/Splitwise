import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ExpenseService } from '../../services/expense.service';
import { CurrencyFormatPipe } from '../../pipes/currency-format.pipe';
import { GroupMember } from '../../models/expense.model';

@Component({
  selector: 'app-groups',
  imports: [FormsModule, CurrencyFormatPipe],
  templateUrl: './groups.html',
  styleUrl: './groups.scss',
})
export class GroupsComponent {
  protected readonly expenseService = inject(ExpenseService);

  protected showNewGroup = signal(false);
  protected showAddMember = signal(false);
  protected newGroupName = '';
  protected newMemberName = '';

  private readonly avatars = ['👤', '👨‍💼', '👩‍💻', '👨‍🔧', '👩‍🎨', '👨‍🔬', '👩‍⚕️', '🧑‍💻', '👷', '🧑‍🍳'];

  createGroup(): void {
    if (!this.newGroupName.trim()) return;
    const group = this.expenseService.createGroup(this.newGroupName.trim(), [
      { id: crypto.randomUUID(), name: 'You', avatar: '👤' },
    ]);
    this.expenseService.setActiveGroup(group.id);
    this.newGroupName = '';
    this.showNewGroup.set(false);
  }

  addMember(): void {
    if (!this.newMemberName.trim()) return;
    const member: GroupMember = {
      id: crypto.randomUUID(),
      name: this.newMemberName.trim(),
      avatar: this.avatars[Math.floor(Math.random() * this.avatars.length)],
    };
    this.expenseService.addMemberToGroup(member);
    this.newMemberName = '';
    this.showAddMember.set(false);
  }

  deleteGroup(groupId: string): void {
    this.expenseService.deleteGroup(groupId);
  }

  groupTotal(groupId: string): number {
    const group = this.expenseService.groups().find((g) => g.id === groupId);
    return group ? group.expenses.reduce((sum, e) => sum + e.amount, 0) : 0;
  }
}
