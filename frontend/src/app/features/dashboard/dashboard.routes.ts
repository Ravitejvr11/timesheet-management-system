import type { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { roleGuard } from '@core/guards/role.guard';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, roleGuard],
    data: {roles: "Employee"},
    loadComponent: () =>
      import('./dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'timesheets/:id/entry',
    canActivate: [authGuard, roleGuard],
    data: {roles: "Employee"},
    loadComponent: () =>
      import('./timesheet-entry/timesheet-entry').then(
        (m) => m.TimesheetEntry,
      ),
  },
];
