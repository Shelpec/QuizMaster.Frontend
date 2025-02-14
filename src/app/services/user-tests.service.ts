import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResponse } from '../dtos/paginated-response';
import { UserTestHistoryDto } from '../dtos/user-test-history.dto';

/** Сущности для UserTest */
export interface AnswerOptionDto {
  id: number;
  text: string;
  isCorrect: boolean;
}

export interface UserTestQuestionDto {
  id: number; // UserTestQuestionId
  questionId: number;
  questionText: string;
  questionType: number; // 0..3
  answerOptions: AnswerOptionDto[];
}

export interface UserTestDto {
  id: number;
  testId: number;
  dateCreated: string;
  userTestQuestions: UserTestQuestionDto[];

  /** Новое поле для времени, может быть null, если тест без лимита */
  expireTime?: string;

  /** Возможно, если у вас есть логика опроса */
  isSurveyTopic?: boolean;
}

/** Для отправки ответов */
export interface UserAnswerSubmitDto {
  userTestQuestionId: number;
  selectedAnswerOptionIds: number[];
  userTextAnswer?: string;
}

/** Результат проверки */
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

  /**
   * Старт теста: POST /api/UserTests/start/{testId}
   */
  startTest(testId: number): Observable<UserTestDto> {
    return this.http.post<UserTestDto>(`${this.baseUrl}/start/${testId}`, {});
  }

  /**
   * Получить "полную" историю UserTests (пример)
   * GET /api/UserTests/all-full?page=...&pageSize=...
   */
  getAllFull(page = 1, pageSize = 5): Observable<PaginatedResponse<UserTestHistoryDto>> {
    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    return this.http.get<PaginatedResponse<UserTestHistoryDto>>(
      `${this.baseUrl}/all-full`,
      { params }
    );
  }

  /**
   * [НУЖНО, если user-tests-history.component.ts вызывает]
   * GET /api/UserTests/by-userEmail?email=...&page=...&pageSize=...
   */
  getByUserEmail(email: string, page = 1, pageSize = 5): Observable<PaginatedResponse<UserTestHistoryDto>> {
    const params = new HttpParams()
      .set('email', email)
      .set('page', page)
      .set('pageSize', pageSize);

    return this.http.get<PaginatedResponse<UserTestHistoryDto>>(
      `${this.baseUrl}/by-userEmail`,
      { params }
    );
  }

  /**
   * [НУЖНО, если user-tests-history.component.ts вызывает]
   * GET /api/UserTests/{id}
   * Допустим, возвращает UserTestHistoryDto
   */
  getByIdFull(userTestId: number): Observable<UserTestHistoryDto> {
    return this.http.get<UserTestHistoryDto>(`${this.baseUrl}/${userTestId}`);
  }

  /**
   * [НУЖНО, если user-tests-history.component.ts вызывает]
   * DELETE /api/UserTests/{id}
   */
  deleteUserTest(userTestId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${userTestId}`);
  }
}
