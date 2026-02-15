import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('@features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('@features/dashboard/dashboard.routes').then(
        (m) => m.DASHBOARD_ROUTES,
      ),
  },
  {
    path: 'manager',
    loadChildren: () =>
      import('@features/manager/manager.routes').then(
        (m) => m.MANAGER_ROUTES,
      ),
  },
  {
    path: 'forbidden',
    loadComponent: () =>
      import('./shared/components/permission-denied/permission-denied').then(
        (m) => m.PermissionDenied,
      ),
  },
];
