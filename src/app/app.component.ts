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
    private translate: TranslateService) {
      // Указываем, какие языки поддерживаем:
      translate.addLangs(['en','ru', 'kz']);
      // Язык по умолчанию:
      translate.setDefaultLang('ru');
      // Если хотим автоматически определить язык браузера:
      const browserLang = translate.getBrowserLang() || 'kz';
      translate.use(['en','ru', 'kz'].includes(browserLang) ? browserLang : 'ru');
  }
  switchLanguage(lang: string) {
    this.translate.use(lang);
  }
  ngOnInit() {
    Aos.init();
  }

  logout(): void {
    this.authService.logout();
    // Обновляем страницу после логаута
    window.location.reload();
  }
  
}
