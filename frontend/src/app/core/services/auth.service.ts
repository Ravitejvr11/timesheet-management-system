import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable} from 'rxjs';
import { tap } from 'rxjs';
import { environment } from '@environments/environment';
import type { LoginRequest, LoginResponse } from '@core/models/auth/auth.model';
import { Router } from '@angular/router';
import { AuthStore } from '@core/state/auth.store';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private authStore = inject(AuthStore);

  private readonly baseUrl = `${environment.apiBaseUrl}/Auth`;

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, data).pipe(
      tap(response => {
        this.authStore.setToken(response.token);
      })
    );
  }

  getToken(): string | null {
    return this.authStore.token();
  }

  logout(): void {
    this.authStore.clear();
    this.router.navigateByUrl('/auth');
  }
}
