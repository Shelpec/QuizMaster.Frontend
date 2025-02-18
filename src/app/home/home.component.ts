import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule], // ✅ Добавляем CommonModule
  templateUrl: './home.component.html'
})
export class HomeComponent {
  constructor(public authService: AuthService) {}
}
