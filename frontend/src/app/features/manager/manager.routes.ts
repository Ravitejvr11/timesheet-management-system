import type { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { roleGuard } from '@core/guards/role.guard';
import { ManagerComponent } from './manager.component';

export const MANAGER_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, roleGuard],
    data: { roles: 'Manager' },
    component: ManagerComponent,
    children: [
      {
        path: '',
        redirectTo: 'projects',
        pathMatch: 'full',
      },
      {
        path: 'projects',
        loadComponent: () =>
          import('./pages/projects/project.page').then(
            (m) => m.ProjectPage,
          ),
      },
      {
        path: 'timesheets',
        loadComponent: () =>
          import('./pages/timesheets/manager-timesheets/manager-timesheets').then(
            (m) => m.ManagerTimesheets,
          ),
      },
      // {
      //   path: 'reports',
      //   loadComponent: () =>
      //     import('./pages/reports/manager-reports').then(
      //       (m) => m.ManagerReports,
      //     ),
      // },
    ],
  },
];

