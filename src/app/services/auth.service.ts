import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName?: string; // или добавьте поля
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Это урл к вашему AuthController
  private authUrl = 'https://localhost:44336/api/auth'; 

  constructor(private http: HttpClient) {}

  /** POST /api/auth/register */
  register(dto: RegisterDto): Observable<any> {
    return this.http.post(`${this.authUrl}/register`, dto);
  }

  /** POST /api/auth/login */
  login(dto: LoginDto): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.authUrl}/login`, dto);
  }

  /** Сохранить токен (например, в localStorage) */
  setToken(token: string) {
    localStorage.setItem('jwtToken', token);
  }

  /** Получить токен из localStorage */
  getToken(): string | null {
    return localStorage.getItem('jwtToken');
  }

  /** Проверить, залогинен ли пользователь (просто проверяем, есть ли токен) */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /** Выйти (удалить токен) */
  logout(): void {
    localStorage.removeItem('jwtToken');
  }
  
}
