import { Component, inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { AuthStore } from '@core/state/auth.store';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})

export class Header {
  private authService = inject(AuthService);
  public authStore = inject(AuthStore);

  logout(): void {
    this.authService.logout();
  }
}
