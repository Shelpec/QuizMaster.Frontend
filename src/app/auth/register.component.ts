// src/app/auth/register.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dtos/auth.dto';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
        this.message = 'Registration successful!';
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
