import { Injectable, signal, computed } from '@angular/core';
import {
  Expense,
  ExpenseGroup,
  GroupMember,
  Balance,
  ExpenseCategory,
  CATEGORIES,
} from '../models/expense.model';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private readonly storageKey = 'splitsmart_groups';

  private readonly groupsSignal = signal<ExpenseGroup[]>(this.loadGroups());

  readonly groups = this.groupsSignal.asReadonly();

  readonly activeGroup = signal<ExpenseGroup | null>(null);

  readonly totalExpenses = computed(() => {
    const group = this.activeGroup();
    if (!group) return 0;
    return group.expenses.reduce((sum, e) => sum + e.amount, 0);
  });

  readonly categoryBreakdown = computed(() => {
    const group = this.activeGroup();
    if (!group) return [];
    const map = new Map<ExpenseCategory, number>();
    for (const e of group.expenses) {
      map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
    }
    return CATEGORIES.map((c) => ({
      ...c,
      amount: map.get(c.key) ?? 0,
      percentage: group.expenses.length
        ? ((map.get(c.key) ?? 0) / this.totalExpenses()) * 100
        : 0,
    })).filter((c) => c.amount > 0);
  });

  readonly balances = computed(() => {
    const group = this.activeGroup();
    if (!group) return [];
    return this.calculateBalances(group);
  });

  readonly recentExpenses = computed(() => {
    const group = this.activeGroup();
    if (!group) return [];
    return [...group.expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  });

  readonly monthlyTrend = computed(() => {
    const group = this.activeGroup();
    if (!group) return [];
    const map = new Map<string, number>();
    for (const e of group.expenses) {
      const month = e.date.substring(0, 7);
      map.set(month, (map.get(month) ?? 0) + e.amount);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, amount]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', {
          month: 'short',
          year: '2-digit',
        }),
        amount,
      }));
  });

  constructor() {
    const groups = this.groupsSignal();
    if (groups.length > 0) {
      this.activeGroup.set(groups[0]);
    } else {
      this.createDefaultGroup();
    }
  }

  createGroup(name: string, members: GroupMember[]): ExpenseGroup {
    const group: ExpenseGroup = {
      id: crypto.randomUUID(),
      name,
      members,
      expenses: [],
      createdAt: new Date().toISOString(),
    };
    this.groupsSignal.update((gs) => [...gs, group]);
    this.persist();
    return group;
  }

  setActiveGroup(groupId: string): void {
    const group = this.groupsSignal().find((g) => g.id === groupId);
    if (group) this.activeGroup.set(group);
  }

  addExpense(expense: Omit<Expense, 'id'>): void {
    const newExpense: Expense = { ...expense, id: crypto.randomUUID() };
    this.groupsSignal.update((gs) =>
      gs.map((g) =>
        g.id === this.activeGroup()?.id
          ? { ...g, expenses: [...g.expenses, newExpense] }
          : g
      )
    );
    this.refreshActiveGroup();
    this.persist();
  }

  deleteExpense(expenseId: string): void {
    this.groupsSignal.update((gs) =>
      gs.map((g) =>
        g.id === this.activeGroup()?.id
          ? { ...g, expenses: g.expenses.filter((e) => e.id !== expenseId) }
          : g
      )
    );
    this.refreshActiveGroup();
    this.persist();
  }

  addMemberToGroup(member: GroupMember): void {
    this.groupsSignal.update((gs) =>
      gs.map((g) =>
        g.id === this.activeGroup()?.id
          ? { ...g, members: [...g.members, member] }
          : g
      )
    );
    this.refreshActiveGroup();
    this.persist();
  }

  deleteGroup(groupId: string): void {
    this.groupsSignal.update((gs) => gs.filter((g) => g.id !== groupId));
    const remaining = this.groupsSignal();
    this.activeGroup.set(remaining.length > 0 ? remaining[0] : null);
    this.persist();
  }

  private refreshActiveGroup(): void {
    const current = this.activeGroup();
    if (current) {
      const updated = this.groupsSignal().find((g) => g.id === current.id);
      if (updated) this.activeGroup.set(updated);
    }
  }

  private calculateBalances(group: ExpenseGroup): Balance[] {
    const netBalances = new Map<string, number>();

    for (const member of group.members) {
      netBalances.set(member.name, 0);
    }

    for (const expense of group.expenses) {
      const share = expense.amount / expense.splitBetween.length;
      netBalances.set(
        expense.paidBy,
        (netBalances.get(expense.paidBy) ?? 0) + expense.amount
      );
      for (const person of expense.splitBetween) {
        netBalances.set(person, (netBalances.get(person) ?? 0) - share);
      }
    }

    const debtors: { name: string; amount: number }[] = [];
    const creditors: { name: string; amount: number }[] = [];

    for (const [name, balance] of netBalances) {
      if (balance < -0.01) debtors.push({ name, amount: -balance });
      else if (balance > 0.01) creditors.push({ name, amount: balance });
    }

    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const result: Balance[] = [];
    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
      const amount = Math.min(debtors[i].amount, creditors[j].amount);
      if (amount > 0.01) {
        result.push({
          from: debtors[i].name,
          to: creditors[j].name,
          amount: Math.round(amount * 100) / 100,
        });
      }
      debtors[i].amount -= amount;
      creditors[j].amount -= amount;
      if (debtors[i].amount < 0.01) i++;
      if (creditors[j].amount < 0.01) j++;
    }

    return result;
  }

  private createDefaultGroup(): void {
    const members: GroupMember[] = [
      { id: '1', name: 'You', avatar: '👤' },
      { id: '2', name: 'Alex', avatar: '👨‍💼' },
      { id: '3', name: 'Sarah', avatar: '👩‍💻' },
      { id: '4', name: 'Mike', avatar: '👨‍🔧' },
    ];

    const group = this.createGroup('Office Team', members);

    const sampleExpenses: Omit<Expense, 'id'>[] = [
      {
        title: 'Team Lunch at Italiano',
        amount: 120,
        category: 'meals',
        paidBy: 'You',
        splitBetween: ['You', 'Alex', 'Sarah', 'Mike'],
        date: '2026-06-14',
        notes: 'Weekly team lunch',
      },
      {
        title: 'Uber to Client Meeting',
        amount: 45,
        category: 'transport',
        paidBy: 'Alex',
        splitBetween: ['You', 'Alex'],
        date: '2026-06-13',
      },
      {
        title: 'Conference Tickets',
        amount: 800,
        category: 'entertainment',
        paidBy: 'Sarah',
        splitBetween: ['You', 'Alex', 'Sarah', 'Mike'],
        date: '2026-06-10',
      },
      {
        title: 'Office Stationery',
        amount: 65,
        category: 'office',
        paidBy: 'Mike',
        splitBetween: ['You', 'Alex', 'Sarah', 'Mike'],
        date: '2026-06-09',
      },
      {
        title: 'Figma Annual License',
        amount: 144,
        category: 'software',
        paidBy: 'You',
        splitBetween: ['You', 'Sarah'],
        date: '2026-06-07',
      },
      {
        title: 'Flight to NYC',
        amount: 350,
        category: 'travel',
        paidBy: 'Alex',
        splitBetween: ['Alex', 'Sarah'],
        date: '2026-06-05',
      },
      {
        title: 'Internet Bill',
        amount: 89,
        category: 'utilities',
        paidBy: 'Sarah',
        splitBetween: ['You', 'Alex', 'Sarah', 'Mike'],
        date: '2026-06-03',
      },
      {
        title: 'Parking Pass',
        amount: 30,
        category: 'miscellaneous',
        paidBy: 'Mike',
        splitBetween: ['Mike', 'You'],
        date: '2026-06-01',
      },
    ];

    this.activeGroup.set(group);
    for (const expense of sampleExpenses) {
      this.addExpense(expense);
    }
  }

  private loadGroups(): ExpenseGroup[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private persist(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.groupsSignal()));
  }
}
