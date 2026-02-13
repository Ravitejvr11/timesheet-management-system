import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./dashboard/dashboard').then(m => m.Dashboard)
  }
];
