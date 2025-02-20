// src/app/auth/register.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dtos/auth.dto';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  email = '';
  password = '';
  firstName = '';
  lastName = '';
  message = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    const dto: RegisterDto = {
      email: this.email,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName
    };

    this.authService.register(dto).subscribe({
      next: () => {
        // После успеха регистрации - тоже отправляем на Home
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Registration failed';
      }
    });
  }

  goLogin() {
    this.router.navigate(['/login']);
  }
}
