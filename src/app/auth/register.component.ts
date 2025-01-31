import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, RegisterDto } from '../services/auth.service';
import { Router } from '@angular/router';

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
      next: (res) => {
        console.log('Registered:', res);
        this.message = 'Registration successful!';
        // Можно сразу логинить или редиректить
        // this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Registration failed';
      }
    });
  }
}
