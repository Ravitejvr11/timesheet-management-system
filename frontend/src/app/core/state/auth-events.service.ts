import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthEventsService {
  private _forceLogout = signal(false);

  readonly forceLogout = this._forceLogout.asReadonly();

  triggerLogout(): void {
    this._forceLogout.set(true);
  }

  reset(): void {
    this._forceLogout.set(false);
  }
}
