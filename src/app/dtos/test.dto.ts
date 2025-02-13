// src/app/dtos/test.dto.ts
import { Question } from './question.dto';

export enum TestTypeEnum {
  QuestionsOnly = 'QuestionsOnly', 
  SurveyOnly = 'SurveyOnly', 
  Mixed = 'Mixed'
  // и т.д., если вы хотите другие значения
}

export interface TestDto {
  id: number;
  name: string;
  countOfQuestions: number;
  topicId?: number;
  topicName?: string;
  createdAt: string;
  isPrivate?: boolean;
  isRandom?: boolean;
  testType?: TestTypeEnum;       // например, "QuestionsOnly"
  timeLimitMinutes?: number | null; // если поле опционально

  // Если нужно выводить привязанные вопросы
  testQuestions?: TestQuestionDto[];
}

// Пример для тест-вопросов (если нужно)
export interface TestQuestionDto {
  id: number;
  testId: number;
  questionId: number;
  question?: Question;  // если нужно
}
