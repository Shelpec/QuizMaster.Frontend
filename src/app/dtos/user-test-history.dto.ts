// src/app/dtos/user-test-history.dto.ts

export interface UserTestHistoryDto {
  userTestId: number;
  dateCreated: string;
  isPassed: boolean;
  correctAnswers: number;
  totalQuestions: number;

  userId: string;
  userEmail: string | null;
  userFullName: string | null;

  testId: number;
  testName: string | null;
  testCountOfQuestions: number;
  topicName: string | null;

  /** Новое поле */
  topicIsSurvey: boolean;

  questions: {
    userTestQuestionId: number;
    questionId: number;
    questionText: string;
    answers: {
      answerOptionId: number;
      text: string;
      isCorrect: boolean;
      isChosen: boolean;
    }[];
  }[];
}
