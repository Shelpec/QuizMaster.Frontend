import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';
import Aos from 'aos';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  title(title: any) {
    throw new Error('Method not implemented.');
  }
  constructor(public authService: AuthService, public themeService: ThemeService) {}
  ngOnInit() {
    Aos.init();
  }

  logout(): void {
    this.authService.logout();
    // Обновляем страницу после логаута
    window.location.reload();
  }
  
}
