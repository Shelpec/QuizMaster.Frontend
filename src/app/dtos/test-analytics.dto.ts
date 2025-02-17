// test-analytics.dto.ts

export interface DifficultQuestionDto {
    questionId: number;
    questionText: string;
    wrongRatePercent: number;
  }
  
  // В ответе analytics + history
  export interface TestAnalyticsWithHistoryDto {
    testId: number;
    testName: string;
    averageScorePercent: number;
    totalAttempts: number;
    averageTimeSeconds: number;
    difficultQuestions: DifficultQuestionDto[];
  
    // Добавлено
    history: UserTestHistoryDto[];
  }
  
  // Те же UserTestHistoryDto, QuestionHistoryDto, AnswerHistoryDto
  // которые вы уже используете в проекте.
  export interface UserTestHistoryDto {
    userTestId: number;
    dateCreated: string;
    isPassed: boolean;
    correctAnswers: number;
    totalQuestions: number;
    userId: string | null;
    userEmail: string | null;
    userFullName: string | null;
    testId: number;
    testName: string;
    testCountOfQuestions: number;
    topicName?: string;
    startTime?: string;
    endTime?: string;
    timeSpentSeconds?: number;
    topicIsSurvey?: boolean;
  
    questions: QuestionHistoryDto[];
  }
  
  export interface QuestionHistoryDto {
    userTestQuestionId: number;
    questionId: number;
    questionText: string;
    questionType: number; // 0..3
    answerOptions: AnswerHistoryDto[];
  }
  
  export interface AnswerHistoryDto {
    answerOptionId?: number;
    text?: string;
    isCorrect: boolean;
    isChosen: boolean;
    userTextAnswer?: string;
  }
  