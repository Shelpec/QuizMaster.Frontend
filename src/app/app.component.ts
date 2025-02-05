import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  template: `
    <div class="nav-bar p-2 bg-light mb-3 d-flex justify-content-between align-items-center">
      <!-- Навигация -->
      <div class="d-flex align-items-center">
        <a routerLink="/questions" class="btn btn-link">Home</a>
        <a routerLink="/tests" class="btn btn-link mx-3">Tests</a>

        <ng-container *ngIf="!authService.isLoggedIn()">
          <a routerLink="/login" class="btn btn-link">Login</a>
          <a routerLink="/register" class="btn btn-link">Register</a>
        </ng-container>

        <ng-container *ngIf="authService.isLoggedIn()">
          <button class="btn btn-secondary" (click)="logout()">Logout</button>
        </ng-container>
      </div>

      <!-- Переключатель тем -->
      <div class="theme-switcher">
        <button class="btn btn-secondary rounded-circle p-2"
                (click)="themeService.toggleTheme()">
          <i [class]="themeService.getCurrentTheme() === 'light-theme' ? 'bi bi-moon' : 'bi bi-sun'"></i>
        </button>
      </div>
    </div>

    <router-outlet></router-outlet>
  `,
})
export class AppComponent {
  title(title: any) {
    throw new Error('Method not implemented.');
  }
  constructor(public authService: AuthService, public themeService: ThemeService) {}

  logout(): void {
    this.authService.logout();
    window.location.reload();
  }
}
