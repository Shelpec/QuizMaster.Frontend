import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Question, CreateQuestionDto, UpdateQuestionDto } from '../dtos/question.dto';
import { PaginatedResponse } from '../dtos/paginated-response';

@Injectable({
  providedIn: 'root'
})
export class QuestionsService {
  private baseUrl = 'https://localhost:44336/api/questions';

  constructor(private http: HttpClient) {}

  /**
   * Получить страницу вопросов
   */
  getAllQuestions(page = 1, pageSize = 5): Observable<PaginatedResponse<Question>> {
    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    return this.http.get<PaginatedResponse<Question>>(this.baseUrl, { params });
  }

  getQuestion(id: number): Observable<Question> {
    return this.http.get<Question>(`${this.baseUrl}/${id}`);
  }

  createQuestion(dto: CreateQuestionDto): Observable<Question> {
    return this.http.post<Question>(this.baseUrl, dto);
  }

  updateQuestion(id: number, dto: UpdateQuestionDto): Observable<Question> {
    return this.http.put<Question>(`${this.baseUrl}/${id}`, dto);
  }

  deleteQuestion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
