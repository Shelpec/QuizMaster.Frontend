// src/app/auth/login.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dtos/auth.dto';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    const dto: LoginDto = {
      email: this.email,
      password: this.password
    };

    this.authService.login(dto).subscribe({
      next: (res) => {
        // Сохраняем токен
        this.authService.setToken(res.token);
        // Сразу отправляем пользователя на Главную
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Login failed';
      }
    });
  }

  goRegister() {
    this.router.navigate(['/register']);
  }
}
