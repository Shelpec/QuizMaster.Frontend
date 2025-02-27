import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import Aos from 'aos';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, TranslateModule],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  title(title: any) {
    throw new Error('Method not implemented.');
  }
  constructor(
    public authService: AuthService, 
    public themeService: ThemeService, 
    public translate: TranslateService
  ) {
    // Указываем поддерживаемые языки:
    translate.addLangs(['en', 'ru', 'kz']);

      // Синхронная установка языка
    const savedLang = localStorage.getItem('language');
    const initialLang = savedLang || translate.getBrowserLang() || 'ru';
    translate.setDefaultLang('ru');
  
  if (['en', 'ru', 'kz'].includes(initialLang)) {
    translate.use(initialLang);
  } else {
    translate.use('ru');
  }
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('language', lang); // Сохраняем язык в localStorage
  }

  ngOnInit() {
    Aos.init();
  }

  logout(): void {
    this.authService.logout();
    window.location.reload();
  }
}
