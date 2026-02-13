import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '@environments/environment';

interface LoginRequest {
  userName: string;
  password: string;
}

interface LoginResponse {
  token: string;
  expiration: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  private readonly baseUrl = `${environment.apiBaseUrl}/Auth`;

  login(data: LoginRequest) {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, data).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
  }
}
