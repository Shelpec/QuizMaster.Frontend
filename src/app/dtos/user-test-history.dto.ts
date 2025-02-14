// src/app/dtos/user-test-history.dto.ts

import { QuestionTypeEnum } from '../enums/question-type.enum';

export interface UserTestHistoryDto {
  userTestId: number;
  userEmail: string;
  userFullName: string;
  testName: string;
  topicName?: string;
  testCountOfQuestions: number;
  dateCreated: string;
  correctAnswers: number;
  totalQuestions: number;
  isPassed: boolean;

  startTime?: string;
  endTime?: string;
  timeSpentSeconds?: number;
  topicIsSurvey?: boolean; // если нужно

  questions: QuestionHistoryDto[];
}

export interface QuestionHistoryDto {
  userTestQuestionId: number;
  questionId: number;
  questionText: string;

  // 0 = SingleChoice, 1=MultipleChoice, 2=Survey, 3=OpenText (к примеру)
  questionType: QuestionTypeEnum;

  // Массив ответов
  answerOptions: AnswerHistoryDto[];
}

export interface AnswerHistoryDto {
  answerOptionId?: number;
  text?: string;
  isCorrect: boolean;
  isChosen: boolean;
  userTextAnswer?: string;
}
