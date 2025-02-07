import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import {
  UserTestsService,
  UserTestDto,
  UserTestQuestionDto,
  TestCheckResultDto
} from '../services/user-tests.service';
import { UserTestAnswersService } from '../services/user-test-answers.service';

@Component({
  selector: 'app-start-test',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './start-test.component.html',
  styleUrls: ['./start-test.component.scss']
})
export class StartTestComponent implements OnInit {
  userTest?: UserTestDto;
  checkResult?: TestCheckResultDto;

  /**
   * Флаг, который выставляем, если это опрос, и мы
   * сохранили ответы (не вызывая checkAnswers).
   */
  surveySaved = false;

  /** Хранит выбранные варианты: для каждого utqId => Set(answerOptionId). */
  selectedAnswersMap: { [utqId: number]: Set<number> } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
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

  /** Загружаем UserTestDto (startTest) */
  startTest(testId: number) {
    this.userTestsService.startTest(testId).subscribe({
      next: (data) => {
        console.log('UserTestDto received:', data);
        this.userTest = data;

        // Инициализируем карты выбранных вариантов
        data.userTestQuestions.forEach(utq => {
          this.selectedAnswersMap[utq.id] = new Set<number>();
        });
      },
      error: (err) => console.error('Error startTest:', err)
    });
  }

  /**
   * Если в вопросе несколько правильных ответов => используем чекбоксы,
   * иначе радио-кнопки
   */
  hasMultipleCorrect(utq: UserTestQuestionDto): boolean {
    // Если у вас в userTest есть отдельный признак опроса (isSurvey)
    // и вы хотите ВСЕГДА чекбоксы для опроса — можете добавить проверку:
    // if (this.userTest?.isSurvey) return true;
    const correctCount = utq.answerOptions.filter(a => a.isCorrect).length;
    return correctCount > 1;
  }

  /**
   * Обработка клика по чекбоксу/радио
   * @param isMultiple true, если несколько правильных (checkbox)
   */
  onSelectAnswer(utqId: number, optionId: number, event: Event, isMultiple: boolean) {
    const set = this.selectedAnswersMap[utqId];
    if (!set) return;

    const checked = (event.target as HTMLInputElement).checked;
    if (isMultiple) {
      if (checked) set.add(optionId);
      else set.delete(optionId);
    } else {
      set.clear();
      if (checked) set.add(optionId);
    }
  }

  /**
   * По кнопке "Finish & Check":
   * 1) Сохраняем ответы
   * 2) Если не опрос => вызываем checkAnswers()
   *    Если опрос => всё, просто выводим "Answers saved (Survey)"
   */
  onFinish() {
    if (!this.userTest) return;
    this.saveAnswers(() => {
      if (this.userTest?.isSurveyTopic) {
        // Это опрос -> подсвечиваем выбранные ответы зелёным
        // и показываем вместо checkResult просто сообщение
        this.surveySaved = true;
      } else {
        // Это обычный тест -> вызываем checkAnswers
        this.checkAnswers();
      }
    });
  }

  /** Сохраняем выбранные ответы */
  private saveAnswers(onSuccess?: () => void) {
    if (!this.userTest) return;
    const userTestId = this.userTest.id;

    // Формируем массив ответов
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
        if (onSuccess) onSuccess();
      },
      error: (err) => console.error('Error saving answers', err)
    });
  }

  /** Для обычного теста запрашиваем checkAnswers => получаем checkResult */
  private checkAnswers() {
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

  /**
   * Подсветка выбранных ответов:
   * - Если surveySaved (и isSurvey) -> всё зелёное
   * - Если есть checkResult -> красим верный в зелёный, неверный в красный
   * - Иначе пока не красим
   */
  getAnswerClass(utqId: number, optionId: number): string {
    // Проверяем, выбрал ли пользователь вариант
    const chosen = this.selectedAnswersMap[utqId]?.has(optionId);
    if (!chosen) return ''; // не выбран => без подсветки

    // 1) Если это опрос и мы уже закончили (surveySaved), то всё зелёное
    if (this.userTest?.isSurveyTopic && this.surveySaved) {
      return 'selected-correct';
    }

    // 2) Если есть checkResult => ищем в userTest.questions -> ans.isCorrect
    if (this.checkResult) {
      // Ищем вопрос
      const question = this.userTest?.userTestQuestions.find(q => q.id === utqId);
      if (!question) return '';

      // Ищем вариант
      const ans = question.answerOptions.find(a => a.id === optionId);
      if (!ans) return '';

      return ans.isCorrect ? 'selected-correct' : 'selected-wrong';
    }

    // 3) Иначе (нет результата) — не подсвечиваем
    return '';
  }

  /** Вернуться к списку тестов */
  goBackToTests() {
    this.router.navigate(['/tests']);
  }
}
