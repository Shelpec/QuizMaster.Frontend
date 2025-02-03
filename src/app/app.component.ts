// src/app/app.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  template: `
    <div class="nav-bar p-2 bg-light mb-3">
      <a routerLink="/questions" class="btn btn-link">Home</a>

      <ng-container *ngIf="!authService.isLoggedIn()">
        <a routerLink="/login" class="btn btn-link">Login</a>
        <a routerLink="/register" class="btn btn-link">Register</a>
      </ng-container>

      <ng-container *ngIf="authService.isLoggedIn()">
        <button class="btn btn-secondary" (click)="logout()">Logout</button>
      </ng-container>
    </div>

    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  title(title: any) {
    throw new Error('Method not implemented.');
  }
  constructor(public authService: AuthService) {}

  logout() {
    this.authService.logout();
    // После логаута сразу перезагрузим страницу
    window.location.reload();
  }
}
