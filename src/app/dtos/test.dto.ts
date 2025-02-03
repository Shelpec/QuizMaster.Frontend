// src/app/dtos/test.dto.ts

export interface TestDto {
    id: number;
    name: string;
    topicId?: number;
    topicName?: string;
    countOfQuestions: number;
    createdAt: string; // или Date
  }
  