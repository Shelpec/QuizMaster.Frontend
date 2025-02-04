import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  UserTestsService,
  UserTestDto,
  UserTestQuestionDto,
  TestCheckResultDto
} from '../services/user-tests.service';
import { UserTestAnswersService } from '../services/user-test-answers.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-start-test',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './start-test.component.html',
  styleUrls: ['./start-test.component.scss'] // <-- подключили SCSS
})
export class StartTestComponent implements OnInit {
  userTest?: UserTestDto;            // Текущий UserTest
  checkResult?: TestCheckResultDto;  // Результат проверки

  /**
   * selectedAnswersMap хранит выбранные ID для каждого userTestQuestionId.
   * Пример: selectedAnswersMap[12] = Set([101,102])
   */
  selectedAnswersMap: { [utqId: number]: Set<number> } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userTestsService: UserTestsService,
    private userTestAnswersService: UserTestAnswersService
  ) {}

  ngOnInit(): void {
    // Считываем testId из URL: /start-test/123
    this.route.paramMap.subscribe(params => {
      const testIdStr = params.get('testId');
      if (testIdStr) {
        const testId = +testIdStr;
        this.startTest(testId);
      }
    });
  }

  /** 1) Обращаемся к /api/UserTests/start/{testId}, получаем userTestDto */
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
      // radio logic
      set.clear();
      if (checked) set.add(optionId);
    }
  }

  /**
   * Нажимаем "Finish & Check":
   * 1) saveAnswers,
   * 2) в success -> checkAnswers
   */
  onFinish() {
    if (!this.userTest) return;
    this.saveAnswers(() => {
      this.checkAnswers();
    });
  }

  /** Сохраняем выбранные ответы (POST /api/UserTestAnswers/{userTestId}/save) */
  private saveAnswers(onSuccess?: () => void) {
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
        if (onSuccess) onSuccess(); // после успеха -> колбэк
      },
      error: (err) => console.error('Error saving answers', err)
    });
  }

  /** Запрашиваем /api/UserTestAnswers/{userTestId}/check -> получаем TestCheckResultDto */
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
   * Подсветка выбранных вариантов (если правильный/неправильный).
   * Возвращаем CSS-класс, который в шаблоне добавляет цвет.
   */
  getAnswerClass(utqId: number, optionId: number): string {
    // Если еще нет результата, не подсвечиваем
    if (!this.checkResult) return '';

    // Проверяем, выбрал ли пользователь этот вариант
    const chosen = this.selectedAnswersMap[utqId]?.has(optionId);
    if (!chosen) return ''; // Не выбран => не красим

    // Нужно понять, правильный ли этот вариант
    // 1) Найдём нужный вопрос
    const question = this.userTest?.userTestQuestions.find(x => x.id === utqId);
    if (!question) return '';

    // 2) Ищем вариант
    const ans = question.answerOptions.find(a => a.id === optionId);
    if (!ans) return '';

    // 3) Если ans.isCorrect => 'selected-correct', иначе 'selected-wrong'
    return ans.isCorrect ? 'selected-correct' : 'selected-wrong';
  }

  /** Кнопка «Back to Tests» */
  goBackToTests() {
    this.router.navigate(['/tests']);
  }
}
