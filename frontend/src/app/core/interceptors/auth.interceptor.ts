import type {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthEventsService } from '@core/state/auth-events.service';
import { AuthStore } from '@core/state/auth.store';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const authEvents = inject(AuthEventsService);

  const token = authStore.token();

  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  if (authStore.isExpired()) {
    authStore.clear();
    router.navigate(['/auth']);
    return next(req);
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authStore.clear();
        authEvents.triggerLogout();
        router.navigate(['/auth']);
      }

      return throwError(() => error);
    }),
  );
};
