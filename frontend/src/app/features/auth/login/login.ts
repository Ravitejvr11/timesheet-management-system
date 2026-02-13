import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginRequest } from '@core/models/auth/auth.model';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private authService = inject(AuthService);

  userName = signal('');
  password = signal('');
  errorMessage = signal('');
  isLoading = signal(false);

  isValid = computed(
    () =>
      this.userName().trim().length > 0 && this.password().trim().length > 0,
  );

  async onSubmit() {
    if (!this.isValid()) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    const payload: LoginRequest = {
      userName: this.userName(),
      password: this.password(),
    };

    this.authService.login(payload).subscribe({
      next: () => {
        console.log('Login successful');
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Invalid username or password');
        this.isLoading.set(false);
      },
    });
  }
}
