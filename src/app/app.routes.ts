import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard';
import { ExpensesComponent } from './components/expenses/expenses';
import { AddExpenseComponent } from './components/add-expense/add-expense';
import { GroupsComponent } from './components/groups/groups';
import { SettlementsComponent } from './components/settlements/settlements';
import { ReportsComponent } from './components/reports/reports';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'expenses', component: ExpensesComponent },
  { path: 'add', component: AddExpenseComponent },
  { path: 'groups', component: GroupsComponent },
  { path: 'settlements', component: SettlementsComponent },
  { path: 'reports', component: ReportsComponent },
  { path: '**', redirectTo: 'dashboard' },
];
