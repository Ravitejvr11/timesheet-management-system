import { inject } from '@angular/core';
import { type CanActivateFn, type ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthStore } from '@core/state/auth.store';

export const roleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as string[];

  const userRole = authStore.role();

  if (!userRole || !allowedRoles.includes(userRole)) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
