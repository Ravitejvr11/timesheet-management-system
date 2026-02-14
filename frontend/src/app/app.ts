import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Header } from './shared/components/header/header';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html'
})
export class App {
  private router = inject(Router);
  private authService = inject(AuthService);

  isLoggedIn = signal(!!this.authService.getToken());

  constructor() {
    this.router.events.subscribe(() => {
      this.isLoggedIn.set(!!this.authService.getToken());
    })
  }
}
