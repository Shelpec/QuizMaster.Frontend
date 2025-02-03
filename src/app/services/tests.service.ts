// src/app/services/tests.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TestDto {
  id: number;
  name: string;
  countOfQuestions: number;
  topicId?: number;
  topicName?: string;
  createdAt: string; 
}

@Injectable({
  providedIn: 'root'
})
export class TestsService {
  private baseUrl = 'https://localhost:44336/api/tests';

  constructor(private http: HttpClient) {}

  /** Получить все тесты (TestDto) */
  getAllTests(): Observable<TestDto[]> {
    return this.http.get<TestDto[]>(this.baseUrl);
  }

  /** Получить тест по ID */
  getTest(id: number): Observable<TestDto> {
    return this.http.get<TestDto>(`${this.baseUrl}/${id}`);
  }

  /** Создать тест: POST /api/tests/create-template?name=... */
  createTest(name: string, countOfQuestions: number, topicId?: number): Observable<TestDto> {
    const params: any = {
      name: name,
      countOfQuestions: countOfQuestions
    };
    if (topicId != null) {
      params.topicId = topicId;
    }
    return this.http.post<TestDto>(`${this.baseUrl}/create-template`, null, { params });
  }

  /** Обновить тест: PUT /api/tests/{id}?newName=... */
  updateTest(id: number, newName: string, countOfQuestions: number, topicId?: number): Observable<TestDto> {
    const params: any = {
      newName: newName,
      countOfQuestions: countOfQuestions
    };
    if (topicId != null) {
      params.topicId = topicId;
    }
    return this.http.put<TestDto>(`${this.baseUrl}/${id}`, null, { params });
  }

  /** Удалить тест: DELETE /api/tests/{id} */
  deleteTest(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
