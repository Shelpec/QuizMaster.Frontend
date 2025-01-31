
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
/** Интерфейсы (модели) — упрощённый вариант */

// Модель вопроса, возвращаемая API
export interface Question {
  id: number;
  text: string;
  answerOptions: AnswerOption[];
  topicName?: string;
  topic?: TopicDto;
}

export interface AnswerOption {
  id: number;
  text: string;
  isCorrect: boolean;
}

export interface TopicDto{
  id: number;
  text: string;
}

// DTO для создания вопроса
export interface CreateQuestionDto {
  text: string;
  // topicId?: number;
  answerOptions: {
    text: string;
    isCorrect: boolean;
  }[];
}

// DTO для обновления вопроса
export interface UpdateQuestionDto {
  text: string;
  answerOptions: {
    id?: number;    // если нужно ID
    text: string;
    isCorrect: boolean;
  }[];
}

// DTO для проверки ответов
export interface AnswerValidationDto {
  questionId: number;
  selectedAnswerIds: number[];
}

// Результат проверки (упрощённо; можете расширить)
export interface AnswerValidationResponseDto {
  correctCount: number;
  results: {
    questionText: string;
    correctAnswers: string[];
    selectedAnswers: string[];
  }[];
}

// =============================================

@Injectable({
  providedIn: 'root'
})
export class QuestionsService {
  private baseUrl = 'https://localhost:44336/api/questions';
  // ↑ Поменяйте на ваш URL, если нужно

  constructor(private http: HttpClient) {}

  /** 1) Получить все вопросы (GET /api/questions) */
  getAllQuestions(): Observable<Question[]> {
    return this.http.get<Question[]>(this.baseUrl);
  }

  /** 2) Получить вопрос по ID (GET /api/questions/{id}) */
  getQuestion(id: number): Observable<Question> {
    return this.http.get<Question>(`${this.baseUrl}/${id}`);
  }

  /** 3) Создать вопрос (POST /api/questions) */
  createQuestion(dto: CreateQuestionDto): Observable<Question> {
    return this.http.post<Question>(this.baseUrl, dto);
  }

  /** 4) Обновить вопрос (PUT /api/questions/{id}) */
  updateQuestion(id: number, dto: UpdateQuestionDto): Observable<Question> {
    return this.http.put<Question>(`${this.baseUrl}/${id}`, dto);
  }

  /** 5) Удалить вопрос (DELETE /api/questions/{id}) */
  deleteQuestion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /** 6) Получить случайные вопросы (GET /api/questions/random?count=X) */
  getRandomQuestions(count: number): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.baseUrl}/random?count=${count}`);
  }

  /** 7) Проверить ответы (POST /api/questions/check-answers) */
  checkAnswers(answers: AnswerValidationDto[]): Observable<AnswerValidationResponseDto> {
    return this.http.post<AnswerValidationResponseDto>(
      `${this.baseUrl}/check-answers`,
      answers
    );
  }
}
