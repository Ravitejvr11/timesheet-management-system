import { Component, effect, inject, signal } from '@angular/core';
import { Header } from './shared/components/header/header';
import { AuthService } from '@core/services/auth.service';
import { AuthEventsService } from '@core/state/auth-events.service';
import { AuthStore } from '@core/state/auth.store';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
})
export class App {
  private authService = inject(AuthService);
  private authEvents = inject(AuthEventsService);
  private authStore = inject(AuthStore);

  isLoggedIn = signal(!!this.authService.getToken());

  constructor() {
    effect(() => {
      if (this.authEvents.forceLogout()) {
        this.authStore.clear();
        this.authEvents.reset();
      }
    });
  }
}
