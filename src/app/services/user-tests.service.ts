// src/app/services/user-tests.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AnswerOptionDto {
  id: number;
  text: string;
  isCorrect: boolean;
}

export interface UserTestQuestionDto {
  id: number;
  questionId: number;
  questionText: string;
  answerOptions: AnswerOptionDto[];
}

export interface UserTestDto {
  id: number;
  testId: number;
  dateCreated: string;
  userTestQuestions: UserTestQuestionDto[];
}

// DTO для отправки выбранных ответов:
export interface UserAnswerSubmitDto {
  userTestQuestionId: number;
  selectedAnswerOptionIds: number[];
}

// Результат проверки:
export interface TestCheckResultDto {
  correctCount: number;
  totalQuestions: number;
  results: QuestionCheckResultDto[];
}
export interface QuestionCheckResultDto {
  questionId: number;
  isCorrect: boolean;
  correctAnswers: string[];
  selectedAnswers: string[];
}

@Injectable({
  providedIn: 'root'
})
export class UserTestsService {
  private baseUrl = 'https://localhost:44336/api/UserTests';

  constructor(private http: HttpClient) {}

  /** Запускаем прохождение теста */
  startTest(testId: number): Observable<UserTestDto> {
    return this.http.post<UserTestDto>(`${this.baseUrl}/start/${testId}`, {});
  }
}
