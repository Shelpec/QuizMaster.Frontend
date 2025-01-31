import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, LoginDto } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
        // res содержит { token: string }
        this.authService.setToken(res.token);
        // перенаправим на домашнюю (или куда нужно)
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Login failed';
      }
    });
  }
}
