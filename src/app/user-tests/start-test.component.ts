// src/app/user-tests/start-test.component.ts

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserTestsService, UserTestDto, UserTestQuestionDto, TestCheckResultDto } from '../services/user-tests.service';
import { UserTestAnswersService } from '../services/user-test-answers.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-start-test',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './start-test.component.html'
})
export class StartTestComponent implements OnInit {
  userTest?: UserTestDto;
  checkResult?: TestCheckResultDto;

  /** 
   * Храним выбранные варианты для каждого UserTestQuestionId
   * Например: selectedAnswersMap[12] = Set([101,102]) 
   */
  selectedAnswersMap: {[utqId: number]: Set<number>} = {};

  constructor(
    private route: ActivatedRoute,
    private userTestsService: UserTestsService,
    private userTestAnswersService: UserTestAnswersService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const testIdStr = params.get('testId');
      if (testIdStr) {
        const testId = +testIdStr;
        this.startTest(testId);
      }
    });
  }

  startTest(testId: number) {
    this.userTestsService.startTest(testId).subscribe({
      next: (data) => {
        console.log('UserTestDto received:', data);
        this.userTest = data;

        // Инициализируем selectedAnswersMap пустыми наборами
        data.userTestQuestions.forEach(utq => {
          this.selectedAnswersMap[utq.id] = new Set<number>();
        });
      },
      error: (err) => console.error('Error startTest:', err)
    });
  }

  /** Определяем, есть ли несколько правильных ответов (тогда делаем checkbox) */
  hasMultipleCorrect(utq: UserTestQuestionDto): boolean {
    const correctCount = utq.answerOptions.filter(a => a.isCorrect).length;
    return correctCount > 1;
  }

  /**
   * При выборе checkbox/radio
   * @param isMultiple - true, если вопрос с несколькими верными (checkbox)
   */
  onSelectAnswer(utqId: number, optionId: number, event: Event, isMultiple: boolean) {
    const set = this.selectedAnswersMap[utqId];
    if (!set) return;

    const checked = (event.target as HTMLInputElement).checked;

    if (isMultiple) {
      // checkbox logic
      if (checked) set.add(optionId);
      else set.delete(optionId);
    } else {
      // radio logic - чистим, ставим только этот
      set.clear();
      if (checked) set.add(optionId);
    }
  }

  /** Сформировать массив UserAnswerSubmitDto, отправить "save" */
  saveAnswers() {
    if (!this.userTest) return;
    const userTestId = this.userTest.id;

    // Преобразуем selectedAnswersMap -> массив {userTestQuestionId, selectedAnswerOptionIds}
    const answers = Object.keys(this.selectedAnswersMap).map(key => {
      const utqId = +key;
      const selectedIds = Array.from(this.selectedAnswersMap[utqId]);
      return {
        userTestQuestionId: utqId,
        selectedAnswerOptionIds: selectedIds
      };
    });

    this.userTestAnswersService.saveAnswers(userTestId, answers).subscribe({
      next: (res) => {
        console.log('SaveAnswers response:', res);
        alert('Answers saved!');
      },
      error: (err) => console.error('Error saving answers', err)
    });
  }

  /** Запрос на /check -> показать результат */
  checkAnswers() {
    if (!this.userTest) return;
    const userTestId = this.userTest.id;

    this.userTestAnswersService.checkAnswers(userTestId).subscribe({
      next: (res) => {
        console.log('CheckAnswers result:', res);
        this.checkResult = res;
      },
      error: (err) => console.error('Error checkAnswers', err)
    });
  }
}
