import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { TestsService } from '../services/tests.service';
import { TopicsService } from '../services/topics.service';
import { QuestionsService } from '../services/questions.service';
import { CategoriesService } from '../services/categories.service';

import { TestDto, TestTypeEnum } from '../dtos/test.dto';
import { CategoryDto } from '../dtos/category.dto';
import { TopicDto } from '../dtos/topic.dto';
import { Question, QuestionTypeEnum } from '../dtos/question.dto';
import { PaginatedResponse } from '../dtos/paginated-response';

import { TestAccessService, IAccessUser } from '../services/test-access.service';
import { UsersService, IUser } from '../services/users.service';
import { UserTestsService } from '../services/user-tests.service';

import { TestAnalyticsComponent } from '../analytics/test-analytics.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-test-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TestAnalyticsComponent,
    NgxChartsModule
  ],
  templateUrl: './test-list.component.html'
})
export class TestListComponent implements OnInit {
  tests: TestDto[] = [];

  // Пагинация
  currentPage = 1;
  pageSize = 5;
  totalPages = 1;
  totalItems = 0;

  // Список топиков (для Edit)
  topics: TopicDto[] = [];

  // Текущий тест (Edit / после создания)
  isNew = false;
  currentTest: Partial<TestDto> = {
    name: '',
    countOfQuestions: 1,
    topicId: undefined,
    isPrivate: false,
    isRandom: false,
    testType: TestTypeEnum.QuestionsOnly,
    timeLimitMinutes: null
  };

  // Типы теста
  testTypes = [
    { label: 'QuestionsOnly', value: TestTypeEnum.QuestionsOnly },
    { label: 'SurveyOnly',    value: TestTypeEnum.SurveyOnly },
    { label: 'Mixed',         value: TestTypeEnum.Mixed }
  ];

  // ===== Manage Access =====
  searchText = '';
  searchResults: IUser[] = [];       // для результатов поиска
  currentAccessUsers: IAccessUser[] = []; // у кого есть доступ

  // ===== Manage Questions =====
  candidateQuestions: Question[] = [];
  testQuestions: Question[] = [];

  newQuestion: Partial<Question> = {
    text: '',
    questionType: QuestionTypeEnum.SingleChoice,
    answerOptions: [
      { id: 0, text: '', isCorrect: false },
      { id: 0, text: '', isCorrect: false }
    ]
  };

  questionTypes = [
    { value: QuestionTypeEnum.SingleChoice,   label: 'SingleChoice' },
    { value: QuestionTypeEnum.MultipleChoice, label: 'MultipleChoice' },
    { value: QuestionTypeEnum.Survey,         label: 'Survey' },
    { value: QuestionTypeEnum.OpenText,       label: 'OpenText' }
  ];

  // ===== Wizard =====
  wizardStep = 1;
  categories: CategoryDto[] = [];
  selectedCategoryId: number | null = null;

  showNewCategoryForm = false;
  newCategoryName = '';

  wizardTopics: TopicDto[] = [];
  selectedTopicId: number | null = null;

  showNewTopicForm = false;
  newTopicName = '';

  wizardTestName = '';
  wizardCountOfQuestions = 1;
  wizardIsPrivate = false;
  wizardIsRandom = false;
  wizardTestType: TestTypeEnum = TestTypeEnum.QuestionsOnly;
  wizardTimeLimitMinutes: number | null = null;

  // Показываем/прячем аналитику
  shownAnalytics: { [testId: number]: boolean } = {};

  constructor(
    public authService: AuthService,
    private testsService: TestsService,
    private topicsService: TopicsService,
    private questionsService: QuestionsService,
    private categoriesService: CategoriesService,
    private testAccessService: TestAccessService,
    private usersService: UsersService,
    private router: Router,
    private userTestsService: UserTestsService
  ) {}

  ngOnInit(): void {
    this.loadTests();
  }

  // ============================
  // Загрузка списка тестов
  // ============================
  loadTests(): void {
    this.testsService.getAllTests(this.currentPage, this.pageSize).subscribe({
      next: (res: PaginatedResponse<TestDto>) => {
        this.tests = res.items;
        this.totalItems = res.totalItems;
        this.totalPages = res.totalPages;
      },
      error: (err) => console.error('Error loading tests', err)
    });
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadTests();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadTests();
    }
  }

  // ============================
  // WIZARD
  // ============================
  openCreateTestWizard(): void {
    this.wizardStep = 1;
    this.selectedCategoryId = null;
    this.showNewCategoryForm = false;
    this.newCategoryName = '';
    this.selectedTopicId = null;
    this.wizardTopics = [];
    this.showNewTopicForm = false;
    this.newTopicName = '';
    this.wizardTestName = '';
    this.wizardCountOfQuestions = 1;
    this.wizardIsPrivate = false;
    this.wizardIsRandom = false;
    this.wizardTestType = TestTypeEnum.QuestionsOnly;
    this.wizardTimeLimitMinutes = null;

    this.loadCategories();
    this.showModal('wizardModal');
  }

  loadCategories(): void {
    this.categoriesService.getAll().subscribe({
      next: (cats) => {
        this.categories = cats;
      },
      error: (err) => console.error('Error loading categories', err)
    });
  }

  toggleNewCategoryForm(): void {
    this.showNewCategoryForm = !this.showNewCategoryForm;
    this.newCategoryName = '';
  }

  saveNewCategory(): void {
    if (!this.newCategoryName.trim()) {
      alert('Category name is required!');
      return;
    }
    this.categoriesService.create({ name: this.newCategoryName.trim() }).subscribe({
      next: (createdCat) => {
        // Обновляем категории
        this.loadCategories();
        // Выбираем новую
        this.selectedCategoryId = createdCat.id;
        this.showNewCategoryForm = false;
        this.newCategoryName = '';
      },
      error: (err) => console.error('Error creating category', err)
    });
  }

  // Шаг 2
  goToStep2(): void {
    if (!this.selectedCategoryId) {
      alert('Выберите категорию!');
      return;
    }
    this.wizardStep = 2;
    // Загружаем только топики этой категории:
    this.topicsService.getByCategoryId(this.selectedCategoryId).subscribe({
      next: (topicList) => {
        this.wizardTopics = topicList;
      },
      error: (err) => console.error('Error loading topics by category', err)
    });
  }
  

  toggleNewTopicForm(): void {
    this.showNewTopicForm = !this.showNewTopicForm;
    this.newTopicName = '';
  }

  saveNewTopic(): void {
    if (!this.newTopicName.trim()) {
      alert('Topic name is required!');
      return;
    }
    if (!this.selectedCategoryId) {
      alert('Нет выбранной категории!');
      return;
    }
    const dto = {
      name: this.newTopicName.trim(),
      categoryId: this.selectedCategoryId
    };
    this.topicsService.create(dto).subscribe({
      next: (createdTopic) => {
        // Перезагружаем топики
        this.topicsService.getAll().subscribe({
          next: (allTopics) => {
            this.wizardTopics = allTopics.filter(t => t.categoryId === this.selectedCategoryId);
            this.selectedTopicId = createdTopic.id;
            this.showNewTopicForm = false;
            this.newTopicName = '';
          },
          error: (err2) => console.error('Error after creating topic', err2)
        });
      },
      error: (err) => console.error('Error creating topic', err)
    });
  }

  // Шаг 3
  goToStep3(): void {
    if (!this.selectedTopicId) {
      alert('Выберите топик!');
      return;
    }
    this.wizardStep = 3;
  }

  saveWizardTest(): void {
    if (!this.wizardTestName.trim()) {
      alert('Test name is required!');
      return;
    }
    if (this.wizardCountOfQuestions <= 0) {
      alert('CountOfQuestions must be > 0');
      return;
    }
    if (!this.selectedTopicId) {
      alert('Невозможно создать тест без топика!');
      return;
    }

    this.testsService.createTest(
      this.wizardTestName.trim(),
      this.wizardCountOfQuestions,
      this.selectedTopicId,
      this.wizardIsPrivate,
      this.wizardIsRandom,
      this.wizardTestType,
      this.wizardTimeLimitMinutes ?? undefined
    ).subscribe({
      next: (createdTest) => {
        // Закрываем
        this.hideModal('wizardModal');
        this.loadTests();

        alert(`Тест "${createdTest.name}" создан!`);

        // ========== Цепочка ==========

        // 1) Если приватный -> открываем Manage Access
        // После закрытия Manage Access -> если !isRandom, открыть Manage Questions
        // 2) Если не приватный, но !isRandom -> сразу Manage Questions
        if (createdTest.isPrivate) {
          // Сохраним текущий тест
          this.currentTest = createdTest;
          // Откроем Manage Access, передавая флаг "после закрытия – ManageQuestions"
          this.openAccessModal(true); 
        } else {
          // Не приватный
          if (!createdTest.isRandom) {
            // сразу Manage Questions
            this.currentTest = createdTest;
            this.openManageQuestions(createdTest);
          }
        }

      },
      error: (err) => console.error('Error creating test', err)
    });
  }

  // ============================
  // EDIT / UPDATE Test
  // ============================
  loadTopics(): void {
    this.topicsService.getAll().subscribe({
      next: (res) => (this.topics = res),
      error: (err) => console.error('Error loading topics', err)
    });
  }

  openEditModal(t: TestDto): void {
    this.isNew = false;
    this.currentTest = { ...t };
    if (this.currentTest.isPrivate == null) this.currentTest.isPrivate = false;
    if (this.currentTest.isRandom == null)  this.currentTest.isRandom = false;
    if (this.currentTest.testType == null)  this.currentTest.testType = TestTypeEnum.QuestionsOnly;

    this.loadTopics();
    this.showModal('testModal');
  }

  saveTest(): void {
    if (!this.currentTest.id) return;
    if (!this.currentTest.name) {
      alert('Test name is required!');
      return;
    }
    if (!this.currentTest.countOfQuestions || this.currentTest.countOfQuestions < 1) {
      alert('CountOfQuestions must be > 0');
      return;
    }

    const name = this.currentTest.name!;
    const count = this.currentTest.countOfQuestions!;
    const topicId = this.currentTest.topicId;
    const isPrivate = !!this.currentTest.isPrivate;
    const isRandom = !!this.currentTest.isRandom;
    const testType = this.currentTest.testType ?? TestTypeEnum.QuestionsOnly;
    const timeLimit = this.currentTest.timeLimitMinutes ?? undefined;

    this.testsService.updateTest(
      this.currentTest.id,
      name, count, topicId,
      isPrivate, isRandom, testType, timeLimit
    ).subscribe({
      next: () => {
        this.hideModal('testModal');
        this.loadTests();
      },
      error: (err) => console.error('Error updating test', err)
    });
  }

  deleteTest(t: TestDto): void {
    if (!confirm(`Delete test "${t.name}"?`)) return;
    this.testsService.deleteTest(t.id).subscribe({
      next: () => this.loadTests(),
      error: (err) => console.error('Error deleting test', err)
    });
  }

  // ============================
  // START TEST
  // ============================
  onStartTest(t: TestDto): void {
    if (!t.id) {
      alert('Нет ID теста!');
      return;
    }
    if (t.isRandom) {
      this.router.navigate(['/start-test', t.id]);
    } else {
      // Проверяем кол-во вопросов
      this.testsService.getTestQuestions(t.id).subscribe({
        next: (qList) => {
          if (qList.length !== t.countOfQuestions) {
            alert(
              `Тест "${t.name}" не готов: требуется ${t.countOfQuestions}, а фактически ${qList.length}.`
            );
            return;
          }
          this.router.navigate(['/start-test', t.id]);
        },
        error: (err) => {
          console.error('Ошибка getTestQuestions:', err);
          alert('Ошибка загрузки вопросов');
        }
      });
    }
  }

  // ============================
  // MANAGE ACCESS
  // ============================
  /**
   * openAccessModal принимает доп. параметр (openManageQAfterClose),
   * чтобы после закрытия модалки Access автоматически открыть Manage Questions
   */
  openAccessModal(openManageQAfterClose: boolean = false): void {
    if (!this.currentTest?.id) return;

    this.searchText = '';
    this.searchResults = [];
    this.loadAccessList(this.currentTest.id);

    // Показываем саму модалку
    this.showModal('accessModal');

    // Подписываемся на событие "hidden.bs.modal", чтобы поймать закрытие
    setTimeout(() => {
      const el = document.getElementById('accessModal');
      if (!el) return;

      const modalObj = (window as any).bootstrap.Modal.getOrCreateInstance(el);

      // Вешаем одноразовый обработчик
      el.addEventListener(
        'hidden.bs.modal',
        () => {
          // Когда модалка Access закрывается
          if (openManageQAfterClose && this.currentTest && !this.currentTest.isRandom) {
            // Откроем Manage Questions
            this.openManageQuestions(this.currentTest as TestDto);
          }
        },
        { once: true } // обработчик один раз
      );
    }, 100);
  }

  loadAccessList(testId: number): void {
    this.testAccessService.getUsersForTest(testId).subscribe({
      next: (users) => {
        this.currentAccessUsers = users;
      },
      error: (err) => console.error('Error loading access list', err)
    });
  }

  onSearchUsers(): void {
    const s = this.searchText.trim();
    if (!s) {
      this.searchResults = [];
      return;
    }
    this.usersService.searchUsers(s).subscribe({
      next: (list) => {
        this.searchResults = list; // IUser[]
      },
      error: (err) => console.error('Error searching users', err)
    });
  }

  addAccess(userId: string): void {
    if (!this.currentTest?.id) return;
    this.testAccessService.addAccess(this.currentTest.id, userId).subscribe({
      next: () => {
        this.loadAccessList(this.currentTest!.id!);
      },
      error: (err) => console.error('Error adding access', err)
    });
  }

  removeAccess(userId: string): void {
    if (!this.currentTest?.id) return;
    this.testAccessService.removeAccess(this.currentTest.id, userId).subscribe({
      next: () => {
        this.loadAccessList(this.currentTest!.id!);
      },
      error: (err) => console.error('Error removing access', err)
    });
  }

  // ============================
  // MANAGE QUESTIONS
  // ============================
  openManageQuestions(t: TestDto): void {
    if (t.isRandom) {
      alert('Случайный тест – нельзя вручную управлять вопросами.');
      return;
    }
    this.currentTest = { ...t };
    this.loadManageQuestionsData(t);
    this.showModal('manageQuestionsModal');
  }

  loadManageQuestionsData(t: TestDto): void {
    this.testsService.getTestQuestions(t.id).subscribe({
      next: (qList) => {
        this.testQuestions = qList;
      },
      error: (err) => {
        if (err.status === 404) {
          this.testQuestions = [];
        } else {
          console.error('Error getTestQuestions', err);
        }
      }
    });

    this.testsService.getCandidateQuestions(t.id).subscribe({
      next: (candQ) => {
        this.candidateQuestions = candQ;
      },
      error: (err) => {
        console.error('Error getCandidateQuestions', err);
        this.candidateQuestions = [];
      }
    });
  }

  addQuestionToTest(questionId: number): void {
    if (!this.currentTest?.id) return;
    if (this.currentTest.countOfQuestions != null &&
        this.testQuestions.length >= this.currentTest.countOfQuestions) {
      alert('Нельзя добавлять больше, чем указано в countOfQuestions!');
      return;
    }
    const addedQ = this.candidateQuestions.find(q => q.id === questionId);
    if (addedQ) {
      this.candidateQuestions = this.candidateQuestions.filter(q => q.id !== questionId);
    }
    this.testsService.addQuestionToTest(this.currentTest.id, questionId).subscribe({
      next: (updatedTest) => {
        if (updatedTest.testQuestions) {
          this.testQuestions = updatedTest.testQuestions
            .filter(tq => tq.question != null)
            .map(tq => tq.question!);
        }
      },
      error: (err) => {
        console.error('Error adding question', err);
        // Откатим локально
        if (addedQ) {
          this.candidateQuestions.push(addedQ);
        }
      }
    });
  }

  removeQuestionFromTest(questionId: number): void {
    if (!this.currentTest?.id) return;
    const removedQ = this.testQuestions.find(q => q.id === questionId);
    this.testsService.removeQuestionFromTest(this.currentTest.id, questionId).subscribe({
      next: (updatedTest) => {
        if (updatedTest.testQuestions) {
          this.testQuestions = updatedTest.testQuestions
            .filter(tq => tq.question != null)
            .map(tq => tq.question!);
        }
        if (removedQ) {
          const alreadyInCand = this.candidateQuestions.some(q => q.id === removedQ.id);
          if (!alreadyInCand) {
            this.candidateQuestions.push(removedQ);
          }
        }
      },
      error: (err) => console.error('Error removing question', err)
    });
  }

  // Создать вопрос
  openCreateQuestionModal(): void {
    this.newQuestion = {
      text: '',
      questionType: QuestionTypeEnum.SingleChoice,
      answerOptions: [
        { id: 0, text: '', isCorrect: false },
        { id: 0, text: '', isCorrect: false }
      ]
    };
    this.showModal('createQuestionModal');
  }

  addOptionToNewQuestion(): void {
    if (!this.newQuestion.answerOptions) {
      this.newQuestion.answerOptions = [];
    }
    this.newQuestion.answerOptions.push({
      id: 0,
      text: '',
      isCorrect: false
    });
  }

  saveNewQuestion(): void {
    if (!this.newQuestion.text || !this.newQuestion.text.trim()) {
      alert('Question text is required!');
      return;
    }
    const qType = this.newQuestion.questionType ?? QuestionTypeEnum.SingleChoice;
    const isSurvey = (qType === QuestionTypeEnum.Survey);

    const dto: any = {
      text: this.newQuestion.text.trim(),
      topicId: this.currentTest?.topicId ?? 1,
      questionType: qType,
      correctTextAnswer: null,
      answerOptions: []
    };
    if (qType === QuestionTypeEnum.OpenText) {
      dto.correctTextAnswer = this.newQuestion.correctTextAnswer ?? '';
    } else {
      let arr = this.newQuestion.answerOptions ?? [];
      arr = arr.filter(a => a.text && a.text.trim() !== '');
      dto.answerOptions = arr.map(a => ({
        text: a.text,
        isCorrect: isSurvey ? false : a.isCorrect
      }));
    }
    this.questionsService.createQuestion(dto).subscribe({
      next: (createdQ) => {
        this.candidateQuestions.push(createdQ);
        this.hideModal('createQuestionModal');
      },
      error: (err) => console.error('Error creating question', err)
    });
  }

  closeManageQuestionsModal(): void {
    this.hideModal('manageQuestionsModal');
  }

  // ============================
  // Show/Hide Analytics
  // ============================
  toggleShowAnalytics(testId: number): void {
    this.shownAnalytics[testId] = !this.shownAnalytics[testId];
  }

  // ============================
  // Bootstrap modals helpers
  // ============================
  private showModal(modalId: string): void {
    const el = document.getElementById(modalId);
    if (!el) return;
    const modalObj = (window as any).bootstrap.Modal.getOrCreateInstance(el);
    modalObj.show();
  }

  private hideModal(modalId: string): void {
    const el = document.getElementById(modalId);
    if (!el) return;
    const modalObj = (window as any).bootstrap.Modal.getOrCreateInstance(el);
    modalObj.hide();
  }
}
