// src/app/home/home.component.ts
import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import * as AOS from 'aos';

// Важно: 
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  ngOnInit() {
    AOS.init();
  }
  constructor(public authService: AuthService) {}
}
