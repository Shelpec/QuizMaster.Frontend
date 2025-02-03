// src/app/services/user-test-answers.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserAnswerSubmitDto, TestCheckResultDto } from './user-tests.service';

@Injectable({
  providedIn: 'root'
})
export class UserTestAnswersService {
  private baseUrl = 'https://localhost:44336/api/UserTestAnswers';

  constructor(private http: HttpClient) {}

  /** POST /api/UserTestAnswers/{userTestId}/save */
  saveAnswers(userTestId: number, answers: UserAnswerSubmitDto[]): Observable<string> {
    // Сервер возвращает строку "Answers saved!"
    return this.http.post<string>(`${this.baseUrl}/${userTestId}/save`, answers);
  }

  /** GET /api/UserTestAnswers/{userTestId}/check */
  checkAnswers(userTestId: number): Observable<TestCheckResultDto> {
    return this.http.get<TestCheckResultDto>(`${this.baseUrl}/${userTestId}/check`);
  }
}
