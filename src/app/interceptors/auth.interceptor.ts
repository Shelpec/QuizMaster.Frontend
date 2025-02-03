import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Пытаемся получить токен из localStorage
    const token = localStorage.getItem('jwtToken'); 
    // Если нашли токен, клонируем запрос и добавляем заголовок Authorization
    if (token) {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(authReq);
    } else {
      // Если нет токена, просто продолжаем без изменений
      return next.handle(req);
    }
  }
}
