import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/** Информация о пользователе, имеющем доступ */
export interface IAccessUser {
  userId: string;
  email: string;
  fullName: string;
}

@Injectable({
  providedIn: 'root'
})
export class TestAccessService {
  private baseUrl = 'https://localhost:44336/api/testaccess';

  constructor(private http: HttpClient) {}

  /** Список пользователей (UserId, Email, FullName) у кого есть доступ к тесту */
  getUsersForTest(testId: number): Observable<IAccessUser[]> {
    return this.http.get<IAccessUser[]>(`${this.baseUrl}/get-users?testId=${testId}`);
  }

  /** Добавить доступ userId к тесту */
  addAccess(testId: number, userId: string): Observable<{ message: string }> {
    // POST /api/testaccess/add-access?testId=...&userId=...
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/add-access?testId=${testId}&userId=${userId}`, 
      {}
    );
  }

  /** Удалить доступ userId к тесту */
  removeAccess(testId: number, userId: string): Observable<{ message: string }> {
    // DELETE /api/testaccess/remove-access?testId=...&userId=...
    return this.http.delete<{ message: string }>(
      `${this.baseUrl}/remove-access?testId=${testId}&userId=${userId}`
    );
  }
}
