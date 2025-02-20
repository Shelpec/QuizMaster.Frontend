import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  UserTestsService,
  UserTestDto,
  UserTestQuestionDto,
  UserAnswerSubmitDto,
  TestCheckResultDto
} from '../services/user-tests.service';

import { UserTestAnswersService } from '../services/user-test-answers.service';
import { QuestionTypeEnum } from '../enums/question-type.enum';
import { TranslateModule } from '@ngx-translate/core';

interface ICheckResultMap {
  [questionId: number]: {
    isCorrect: boolean;
    correctAnswers: string[];
    selectedAnswers: string[];
  };
}

@Component({
  selector: 'app-start-test',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './start-test.component.html',
  styleUrls: ['./start-test.component.scss']
})
export class StartTestComponent implements OnInit, OnDestroy {
  userTest?: UserTestDto;
  checkResult?: TestCheckResultDto;
  surveySaved = false;

  // Для отслеживания времени
  timeLeftSeconds = 0;   // Сколько осталось секунд
  timeIsUp = false;      // Флаг "время истекло" -> показывает модалку
  private timerInterval?: any; // setInterval

  // Храним выбранные варианты
  selectedAnswersMap: { [utqId: number]: Set<number> } = {};
  // Храним введённые ответы для OpenText
  openTextMap: { [utqId: number]: string } = {};

  private checkAnswerMap: ICheckResultMap = {};

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

  ngOnDestroy(): void {
    // Очищаем таймер при уходе со страницы
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  /**
   * Здесь мы вызываем наш бекенд, который вернет UserTestDto.
   * Если тест isRandom = true, то на бекенде сгенерируются случайные вопросы именно сейчас.
   */
  startTest(testId: number) {
    this.userTestsService.startTest(testId).subscribe({
      next: (data) => {
        this.userTest = data;

        // Инициализация выбранных ответов
        data.userTestQuestions.forEach(utq => {
          this.selectedAnswersMap[utq.id] = new Set<number>();
          if (utq.questionType === QuestionTypeEnum.OpenText) {
            this.openTextMap[utq.id] = '';
          }
        });

        // Запускаем таймер, если есть лимит времени
        if (data.expireTime) {
          this.initTimer(data.expireTime);
        }
      },
      error: (err) => {
        console.error('Ошибка при старте теста', err);
        alert('Ошибка при старте теста: ' + err.error);
      }
    });
  }

  /**
   * Запускаем обратный отсчёт до expireTime
   */
  private initTimer(expireTimeStr: string) {
    const expireDate = new Date(expireTimeStr);
    const now = new Date();
    const diffMs = expireDate.getTime() - now.getTime();
    this.timeLeftSeconds = Math.max(0, Math.floor(diffMs / 1000));

    this.timerInterval = setInterval(() => {
      this.timeLeftSeconds--;
      if (this.timeLeftSeconds <= 0) {
        this.timeLeftSeconds = 0;
        this.timeIsUp = true; // открываем модалку
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  /**
   * Форматированный вывод времени (ч:мин:сек или мин:сек).
   */
  formatTimeLeft(): string {
    const sec = this.timeLeftSeconds % 60;
    const totalMin = Math.floor(this.timeLeftSeconds / 60);
    const min = totalMin % 60;
    const hours = Math.floor(totalMin / 60);

    const secStr = sec < 10 ? '0' + sec : sec;
    const minStr = min < 10 ? '0' + min : min;
    if (hours > 0) {
      return `${hours}:${minStr}:${secStr}`;
    } else {
      return `${minStr}:${secStr}`;
    }
  }

  /**
   * Обработка выбора ответа (radio/checkbox)
   */
  onSelectAnswer(utqId: number, optionId: number, event: Event, isMultiple: boolean): void {
    // Если время истекло, запрещаем выбирать
    if (this.timeIsUp) {
      return;
    }

    const set = this.selectedAnswersMap[utqId];
    if (!set) return;

    const checked = (event.target as HTMLInputElement).checked;
    if (isMultiple) {
      // MultipleChoice / Survey
      if (checked) set.add(optionId);
      else set.delete(optionId);
    } else {
      // SingleChoice
      set.clear();
      if (checked) set.add(optionId);
    }
  }

  /**
   * Завершение теста => сохраняем ответы => если не Survey, то проверяем
   * Скрываем модалку timeIsUp после сохранения.
   */
  onFinish() {
    if (!this.userTest) return;

    // Останавливаем таймер
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    // Сохраняем ответы на сервере
    this.saveAnswers(() => {
      // Если тест "Survey" => не проверяем правильность
      if (this.userTest?.isSurveyTopic) {
        this.surveySaved = true;
        this.timeIsUp = false; // прячем модалку
      } else {
        // Иначе — запрашиваем проверку
        this.checkAnswers(() => {
          this.timeIsUp = false; // прячем модалку
        });
      }
    });
  }

  /**
   * POST /saveAnswers
   */
  private saveAnswers(onSuccess?: () => void) {
    if (!this.userTest) return;
    const userTestId = this.userTest.id;

    const answers: UserAnswerSubmitDto[] = [];

    for (const utq of this.userTest.userTestQuestions) {
      if (utq.questionType === QuestionTypeEnum.OpenText) {
        // open text
        const text = this.openTextMap[utq.id] ?? '';
        answers.push({
          userTestQuestionId: utq.id,
          selectedAnswerOptionIds: [],
          userTextAnswer: text
        });
      } else {
        // single/multiple/survey
        const chosenIds = Array.from(this.selectedAnswersMap[utq.id]);
        answers.push({
          userTestQuestionId: utq.id,
          selectedAnswerOptionIds: chosenIds
        });
      }
    }

    this.userTestAnswersService.saveAnswers(userTestId, answers).subscribe({
      next: () => {
        if (onSuccess) onSuccess();
      },
      error: (err) => console.error('Error saving answers', err)
    });
  }

  /**
   * GET /checkAnswers
   */
  private checkAnswers(afterCheckCallback?: () => void) {
    if (!this.userTest) return;

    const userTestId = this.userTest.id;
    this.userTestAnswersService.checkAnswers(userTestId).subscribe({
      next: (res) => {
        this.checkResult = res;

        // Создаём карту для подсветки
        this.checkAnswerMap = {};
        res.results.forEach(r => {
          this.checkAnswerMap[r.questionId] = {
            isCorrect: r.isCorrect,
            correctAnswers: r.correctAnswers,
            selectedAnswers: r.selectedAnswers
          };
        });

        if (afterCheckCallback) {
          afterCheckCallback();
        }
      },
      error: (err) => console.error('Error checkAnswers', err)
    });
  }

  /**
   * Подсветка (radio/checkbox) после проверки
   */
  getAnswerClass(utqId: number, optionId: number): string {
    const isChosen = this.selectedAnswersMap[utqId]?.has(optionId);
    if (!isChosen) return '';

    if (!this.checkResult) {
      // Не проверяли ещё => без подсветки
      return '';
    }

    // Найти вопрос
    const utq = this.userTest?.userTestQuestions.find(q => q.id === utqId);
    if (!utq) return '';

    // Survey/OpenText => пусть всё будет зелёным
    if (utq.questionType === QuestionTypeEnum.Survey
     || utq.questionType === QuestionTypeEnum.OpenText) {
      return 'selected-correct';
    }

    // Проверка, был ли ответ правильным
    const checkData = this.checkAnswerMap[utq.questionId];
    if (!checkData) return '';

    const ansDto = utq.answerOptions.find(a => a.id === optionId);
    if (!ansDto) return '';

    const isCorrect = checkData.correctAnswers.includes(ansDto.text);
    return isCorrect ? 'selected-correct' : 'selected-wrong';
  }

  /**
   * Подсветка для текстовых ответов
   */
  getOpenTextClass(utqId: number): string {
    if (!this.checkResult) {
      // Не проверяли => без подсветки
      return '';
    }

    const utq = this.userTest?.userTestQuestions.find(q => q.id === utqId);
    if (!utq) return '';

    // Survey/OpenText => всё зелёное
    if (utq.questionType === QuestionTypeEnum.Survey
     || utq.questionType === QuestionTypeEnum.OpenText) {
      return 'selected-correct-textbox';
    }

    // Иначе смотрим реальный результат
    const checkData = this.checkAnswerMap[utq.questionId];
    if (!checkData) return '';

    return checkData.isCorrect ? 'selected-correct-textbox' : 'selected-wrong-textbox';
  }

  /**
   * Кнопка "Back to Tests"
   */
  goBackToTests() {
    this.router.navigate(['/tests']);
  }
}
