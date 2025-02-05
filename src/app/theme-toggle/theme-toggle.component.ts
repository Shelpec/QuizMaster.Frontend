import { Component } from '@angular/core';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  template: `
    <button class="btn btn-outline-primary" (click)="toggleTheme()">
      {{ themeService.getCurrentTheme() === 'light-theme' ? 'Темная тема' : 'Светлая тема' }}
    </button>
  `,
})
export class ThemeToggleComponent {
  constructor(public themeService: ThemeService) {}

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
