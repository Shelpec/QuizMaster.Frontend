import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface IUser {
  id: string;
  email: string;
  fullName: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private baseUrl = 'https://localhost:44336/api/users'; // см. UsersController

  constructor(private http: HttpClient) {}

  /**
   * Поиск пользователей
   * GET /api/users?search=...
   */
  searchUsers(search: string): Observable<IUser[]> {
    return this.http.get<IUser[]>(`${this.baseUrl}?search=${encodeURIComponent(search)}`);
  }
}
