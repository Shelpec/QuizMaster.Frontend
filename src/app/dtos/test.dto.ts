// src/app/dtos/test.dto.ts

export interface TestDto {
  id: number;
  name: string;
  countOfQuestions: number;
  topicId?: number;
  topicName?: string;
  createdAt: string; 
  isPrivate?: boolean; // <-- добавили
}
