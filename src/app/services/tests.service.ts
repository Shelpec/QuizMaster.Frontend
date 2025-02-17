// src/app/services/tests.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResponse } from '../dtos/paginated-response';
import { TestDto, TestTypeEnum } from '../dtos/test.dto';
import { Question } from '../dtos/question.dto';

@Injectable({
  providedIn: 'root'
})
export class TestsService {
  private baseUrl = 'https://localhost:44336/api/tests';

  constructor(private http: HttpClient) {}
  
  // tests.service.ts
  addQuestionToTest(testId: number, questionId: number): Observable<TestDto> {
    return this.http.post<TestDto>(`${this.baseUrl}/${testId}/questions/${questionId}`, {});
  }

  // Удалить вопрос из теста
  removeQuestionFromTest(testId: number, questionId: number): Observable<TestDto> {
    return this.http.delete<TestDto>(`${this.baseUrl}/${testId}/questions/${questionId}`);
  }

  getTestQuestions(testId: number): Observable<Question[]> {
    // GET /api/tests/{testId}/questions
    return this.http.get<Question[]>(`${this.baseUrl}/${testId}/questions`);
  }


  getAllTests(page = 1, pageSize = 5): Observable<PaginatedResponse<TestDto>> {
    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    return this.http.get<PaginatedResponse<TestDto>>(this.baseUrl, { params });
  }

  getTest(id: number): Observable<TestDto> {
    return this.http.get<TestDto>(`${this.baseUrl}/${id}`);
  }

  /**
   * Создать новый тест (create-template).
   * На сервере: POST /api/tests/create-template?name=...&countOfQuestions=...&topicId=...
   * Параметры: isPrivate, isRandom, testType, timeLimitMinutes
   */
  createTest(
    name: string,
    countOfQuestions: number,
    topicId?: number,
    isPrivate = false,
    isRandom = false,
    testType: TestTypeEnum = TestTypeEnum.QuestionsOnly,
    timeLimitMinutes?: number
  ): Observable<TestDto> {
    let params = new HttpParams()
      .set('name', name)
      .set('countOfQuestions', countOfQuestions)
      .set('isPrivate', isPrivate);

    if (topicId != null) {
      params = params.set('topicId', topicId);
    }

    // isRandom, testType, timeLimit
    params = params.set('isRandom', isRandom);
    // testType - передаём как строку (например, "QuestionsOnly")
    params = params.set('testType', testType);

    if (timeLimitMinutes != null) {
      params = params.set('timeLimitMinutes', timeLimitMinutes);
    }

    return this.http.post<TestDto>(`${this.baseUrl}/create-template`, null, {
      params
    });
  }

  /**
   * Обновить существующий тест (PUT /api/tests/{id}?newName=...&countOfQuestions=...).
   */
  updateTest(
    id: number,
    newName: string,
    countOfQuestions: number,
    topicId?: number,
    isPrivate = false,
    isRandom = false,
    testType: TestTypeEnum = TestTypeEnum.QuestionsOnly,
    timeLimitMinutes?: number
  ): Observable<TestDto> {
    let params = new HttpParams()
      .set('newName', newName)
      .set('countOfQuestions', countOfQuestions)
      .set('isPrivate', isPrivate)
      .set('isRandom', isRandom)
      .set('testType', testType);

    if (topicId != null) {
      params = params.set('topicId', topicId);
    }

    if (timeLimitMinutes != null) {
      params = params.set('timeLimitMinutes', timeLimitMinutes);
    }

    return this.http.put<TestDto>(`${this.baseUrl}/${id}`, null, {
      params
    });
  }

  deleteTest(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
 * Возвращает список «кандидатных» вопросов, которые можно вручную
 * добавить к тесту (учитывая topicId и testType).
 */
  getCandidateQuestions(testId: number): Observable<Question[]> {
    // GET /api/tests/{testId}/candidate-questions
    return this.http.get<Question[]>(`${this.baseUrl}/${testId}/candidate-questions`);
  }

}
export type { TestDto };

