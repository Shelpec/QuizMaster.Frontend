// src/app/dtos/question.dto.ts

export interface Question {
    id: number;
    text: string;
    topicId?: number;      // ID темы
    topicName?: string;    // имя темы
    answerOptions: AnswerOption[];
  }
  
  export interface AnswerOption {
    id: number;
    text: string;
    isCorrect: boolean;
  }
  
  export interface CreateQuestionDto {
    text: string;
    topicId?: number; // <- новое поле
    answerOptions: {
      text: string;
      isCorrect: boolean;
    }[];
  }
  
  export interface UpdateQuestionDto {
    text: string;
    topicId?: number; // <- новое поле
    answerOptions: {
      id?: number;
      text: string;
      isCorrect: boolean;
    }[];
  }
  