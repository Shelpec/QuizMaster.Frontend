import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private currentTheme = 'light-theme';

  constructor() {
    const savedTheme = localStorage.getItem('theme') || 'light-theme';
    this.setTheme(savedTheme);
  }

  setTheme(theme: string) {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(theme);
    this.currentTheme = theme;
    localStorage.setItem('theme', theme);
  }

  toggleTheme() {
    this.setTheme(this.currentTheme === 'light-theme' ? 'dark-theme' : 'light-theme');
  }

  getCurrentTheme(): string {
    return this.currentTheme;
  }
}
