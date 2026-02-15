import { inject } from '@angular/core';
import {
  type CanActivateFn,
  type ActivatedRouteSnapshot,
  Router,
} from '@angular/router';
import { AuthStore } from '@core/state/auth.store';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as string[];
  const userRole = authStore.role();

  if (!userRole) {
    return router.createUrlTree(['/auth']);
  }

  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }
  if (!allowedRoles.includes(userRole)) {
    const roleRoutes: Record<string, string> = {
      Manager: '/manager',
      Employee: '/dashboard',
    };

    const redirectTo = roleRoutes[userRole] ?? '/forbidden';

    return router.createUrlTree([redirectTo]);
  }

  return true;
};
