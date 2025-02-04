export interface UserTestHistoryDto {
    userTestId: number;
    userId: string;
    userEmail?: string;
    userFullName?: string;
  
    testId: number;
    testName?: string;
    testCountOfQuestions: number;
    topicName?: string;
  
    totalQuestions: number;
    correctAnswers: number;
    isPassed: boolean;
    dateCreated: string; // или Date
  
    questions: QuestionHistoryDto[];
  }
  
  export interface QuestionHistoryDto {
    userTestQuestionId: number;
    questionId: number;
    questionText: string;
    answers: AnswerHistoryDto[];
  }
  
  export interface AnswerHistoryDto {
    answerOptionId: number;
    text: string;
    isCorrect: boolean;
    isChosen: boolean;
  }
  