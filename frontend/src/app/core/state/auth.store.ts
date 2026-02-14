import { Injectable, signal, computed, effect } from '@angular/core';
import type { JwtPayload } from '@core/models/auth/auth.model';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  private _token = signal<string | null>(localStorage.getItem('token'));
  private _user = signal<JwtPayload | null>(this.decodeToken(this._token()));

  readonly token = computed(() => this._token());
  readonly user = computed(() => this._user());
  readonly isAuthenticated = computed(() => !!this._token());
  readonly role = computed(() => this._user()?.role ?? null);

  readonly isExpired = computed(() => {
    const user = this._user();
    if (!user) return true;

    const now = Math.floor(Date.now() / 1000);
    return user.exp < now;
  });

  constructor() {
    effect(() => {
      if (this._token() && this.isExpired()) {
        this.clear();
      }
    });
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
    this._token.set(token);
    this._user.set(this.decodeToken(token));
  }

  clear(): void {
    localStorage.removeItem('token');
    this._token.set(null);
    this._user.set(null);
  }

  private decodeToken(token: string | null): JwtPayload | null {
    if (!token) return null;

    try {
      return jwtDecode<JwtPayload>(token);
    } catch {
      return null;
    }
  }
}
