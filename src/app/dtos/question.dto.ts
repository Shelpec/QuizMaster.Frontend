// src/app/dtos/question.dto.ts

import { QuestionTypeEnum } from '../enums/question-type.enum'; 
// или перенесите enum внутрь этого файла

export interface Question {
  id: number;
  text: string;
  topicId?: number;
  topicName?: string;

  /**
   * Поля, которые раньше были только в Create/Update DTO,
   * но мы хотим видеть их и в самом Question (на фронте):
   */
  questionType?: QuestionTypeEnum;
  correctTextAnswer?: string;

  answerOptions: AnswerOption[];
}

export interface AnswerOption {
  id: number;
  text: string;
  isCorrect: boolean;
}

/**
 * Если вы используете CreateQuestionDto / UpdateQuestionDto 
 * отдельно, то можете оставить их как есть:
 */
export interface CreateQuestionDto {
  text: string;
  topicId?: number;
  questionType: QuestionTypeEnum;
  correctTextAnswer?: string | null;
  answerOptions: {
    text: string;
    isCorrect: boolean;
  }[];
}

export interface UpdateQuestionDto {
  text: string;
  topicId?: number;
  questionType: QuestionTypeEnum;
  correctTextAnswer?: string | null;
  answerOptions: {
    text: string;
    isCorrect: boolean;
  }[];
}
export { QuestionTypeEnum };

