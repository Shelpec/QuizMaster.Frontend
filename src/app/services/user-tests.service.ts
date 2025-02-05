import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserTestHistoryDto } from '../dtos/user-test-history.dto';
import { PaginatedResponse } from '../dtos/paginated-response';

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

export interface UserAnswerSubmitDto {
  userTestQuestionId: number;
  selectedAnswerOptionIds: number[];
}

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
   * Получить все userTest'ы (в расширенном виде) с пагинацией
   */
  getAllFull(page = 1, pageSize = 5): Observable<PaginatedResponse<UserTestHistoryDto>> {
    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    return this.http.get<PaginatedResponse<UserTestHistoryDto>>(`${this.baseUrl}/all-full`, { params });
  }

  /** Поиск конкретного userTestId (full) */
  getByIdFull(userTestId: number): Observable<UserTestHistoryDto> {
    return this.http.get<UserTestHistoryDto>(`${this.baseUrl}/${userTestId}`);
  }

  /**
   * Поиск по email (full) c пагинацией
   * /api/UserTests/by-userEmail?email=some@domain&page=1&pageSize=5
   */
  getByUserEmail(email: string, page = 1, pageSize = 5): Observable<PaginatedResponse<UserTestHistoryDto[]>> {
    // ОБРАТИТЕ ВНИМАНИЕ: если на бэкенде реализовано иначе, корректируйте.
    // Предположим, что вы тоже поддерживаете пагинацию при поиске по email
    let params = new HttpParams()
      .set('email', email)
      .set('page', page)
      .set('pageSize', pageSize);

    return this.http.get<PaginatedResponse<UserTestHistoryDto[]>>(`${this.baseUrl}/by-userEmail`, { params });
  }

  /** Удалить userTest */
  deleteUserTest(userTestId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${userTestId}`);
  }

  /** Запускаем прохождение теста */
  startTest(testId: number): Observable<UserTestDto> {
    return this.http.post<UserTestDto>(`${this.baseUrl}/start/${testId}`, {});
  }
}
