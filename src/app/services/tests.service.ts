import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResponse } from '../dtos/paginated-response';

export interface TestDto {
  id: number;
  name: string;
  countOfQuestions: number;
  topicId?: number;
  topicName?: string;
  createdAt: string;
  isPrivate?: boolean; // <-- важно
}

@Injectable({
  providedIn: 'root'
})
export class TestsService {
  private baseUrl = 'https://localhost:44336/api/tests';

  constructor(private http: HttpClient) {}

  // Получить страницу тестов
  getAllTests(page = 1, pageSize = 5): Observable<PaginatedResponse<TestDto>> {
    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    return this.http.get<PaginatedResponse<TestDto>>(this.baseUrl, { params });
  }

  getTest(id: number): Observable<TestDto> {
    return this.http.get<TestDto>(`${this.baseUrl}/${id}`);
  }

  /** Создать тест (create-template?...) */
  createTest(
    name: string,
    countOfQuestions: number,
    topicId?: number,
    isPrivate = false
  ): Observable<TestDto> {
    const params: any = {
      name,
      countOfQuestions,
      isPrivate
    };
    if (topicId != null) {
      params.topicId = topicId;
    }
    return this.http.post<TestDto>(`${this.baseUrl}/create-template`, null, { params });
  }

  /** Обновить тест (PUT /api/tests/{id}?newName=...,isPrivate=...) */
  updateTest(
    id: number,
    newName: string,
    countOfQuestions: number,
    topicId?: number,
    isPrivate = false
  ): Observable<TestDto> {
    const params: any = {
      newName,
      countOfQuestions,
      isPrivate
    };
    if (topicId != null) {
      params.topicId = topicId;
    }
    return this.http.put<TestDto>(`${this.baseUrl}/${id}`, null, { params });
  }

  deleteTest(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
