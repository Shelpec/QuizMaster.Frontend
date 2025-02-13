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

  // Пример простого метода с query-параметрами
  // topicId: number
  // allowedTypes: string[] (например ["SingleChoice", "MultipleChoice"])
  getQuestionsFiltered(topicId: number, allowedTypes: string[]): Observable<Question[]> {
    // Превращаем массив в query-параметр, например allowedTypes=SingleChoice&allowedTypes=MultipleChoice
    let params = new HttpParams().set('topicId', topicId);
    allowedTypes.forEach(type => {
      params = params.append('allowedTypes', type);
    });

    return this.http.get<Question[]>(`${this.baseUrl}/filter`, { params });
  }

  // Если у вас нет эндпоинта /questions/filter на бэке, можно сделать /questions?topicId=&type=...
  // Или вы можете на фронте загрузить все вопросы по topicId, а потом вручную отфильтровать по типу.

  // Пример "getAllByTopic(topicId)", без типа:
  getAllByTopic(topicId: number): Observable<Question[]> {
    // Предположим, вы добавили в контроллер:
    // [HttpGet]
    // public async Task<ActionResult<IEnumerable<QuestionDto>>> GetQuestions([FromQuery] int? topicId = null) ...
    // и фильтруете, если topicId != null
    const url = `${this.baseUrl}?topicId=${topicId}`;
    return this.http.get<Question[]>(url);
  }
  /**
   * Получить страницу вопросов
   */
  getAllQuestionsAll(): Observable<Question[]> {
    return this.http.get<Question[]>(this.baseUrl);
  }

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
