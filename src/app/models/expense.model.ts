export type ExpenseCategory =
  | 'meals'
  | 'travel'
  | 'office'
  | 'entertainment'
  | 'utilities'
  | 'software'
  | 'transport'
  | 'miscellaneous';

export interface CategoryInfo {
  key: ExpenseCategory;
  label: string;
  icon: string;
  color: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { key: 'meals', label: 'Meals & Dining', icon: '🍽️', color: '#f97316' },
  { key: 'travel', label: 'Business Travel', icon: '✈️', color: '#3b82f6' },
  { key: 'office', label: 'Office Supplies', icon: '📎', color: '#8b5cf6' },
  { key: 'entertainment', label: 'Entertainment', icon: '🎭', color: '#ec4899' },
  { key: 'utilities', label: 'Utilities', icon: '💡', color: '#eab308' },
  { key: 'software', label: 'Software & Tools', icon: '💻', color: '#06b6d4' },
  { key: 'transport', label: 'Local Transport', icon: '🚕', color: '#10b981' },
  { key: 'miscellaneous', label: 'Miscellaneous', icon: '📦', color: '#6b7280' },
];

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  paidBy: string;
  splitBetween: string[];
  date: string;
  notes?: string;
}

export interface GroupMember {
  id: string;
  name: string;
  avatar: string;
}

export interface ExpenseGroup {
  id: string;
  name: string;
  members: GroupMember[];
  expenses: Expense[];
  createdAt: string;
}

export interface Balance {
  from: string;
  to: string;
  amount: number;
}
