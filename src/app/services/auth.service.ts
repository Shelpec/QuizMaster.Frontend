import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginDto, RegisterDto } from '../dtos/auth.dto';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authUrl = 'https://localhost:44336/api/auth'; // URL к вашему AuthController

  constructor(private http: HttpClient) {}

  // --- Авторизация / Регистрация ---
  register(dto: RegisterDto): Observable<any> {
    return this.http.post(`${this.authUrl}/register`, dto);
  }

  login(dto: LoginDto): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.authUrl}/login`, dto);
  }

  // --- Работа с JWT в localStorage ---
  setToken(token: string) {
    localStorage.setItem('jwtToken', token);
  }

  getToken(): string | null {
    return localStorage.getItem('jwtToken');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('jwtToken');
  }

  // --- Расширение: декодирование JWT, определение роли и email ---
  /**
   * Возвращает список ролей пользователя из токена (['Admin'] или ['User']).
   */
/**
 * Пример, как декодировать роли, учитывая разные варианты:
 * - "role": "Admin"
 * - "roles": ["Admin","User"]
 * - "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": ["Admin"]
 */
getUserRoles(): string[] {
  const token = this.getToken();
  if (!token) return [];

  // Разбиваем на части: header.payload.signature
  const payloadBase64 = token.split('.')[1];
  if (!payloadBase64) return [];

  try {
    // Декодируем Base64
    const payloadString = atob(payloadBase64);
    const payloadObject = JSON.parse(payloadString);

    // 1) Проверяем ключ "role" (иногда строка, иногда массив)
    let roles = payloadObject['role'];
    if (!roles) {
      // 2) Проверяем ключ "roles" (если на бэке массив)
      roles = payloadObject['roles'];
    }
    if (!roles) {
      // 3) Проверяем "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      roles = payloadObject['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    }

    if (!roles) {
      return [];
    }

    // Если роль одна (строка "Admin"), превратим в массив
    if (typeof roles === 'string') {
      return [roles];
    }
    // Если уже массив ["Admin","User"], вернём как есть
    if (Array.isArray(roles)) {
      return roles;
    }

    // Если вдруг формат другой, вернем пустой
    return [];
  } catch (e) {
    console.error('JWT decode error:', e);
    return [];
  }
}


  /**
   * Проверка, является ли пользователь Админом
   */
  isAdmin(): boolean {
    return this.getUserRoles().includes('Admin');
  }
  
  /**
   * Достаём email пользователя из токена (ClaimTypes.Email обычно = "email")
   */
  getEmail(): string | null {
    const token = this.getToken();
    if (!token) return null;

    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return null;

    try {
      const payloadString = atob(payloadBase64);
      const payloadObject = JSON.parse(payloadString);
      return payloadObject['email'] || null;
    } catch (e) {
      console.error('JWT decode error:', e);
      return null;
    }
  }
}
