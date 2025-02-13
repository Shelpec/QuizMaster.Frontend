import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Сервисы
import { AuthService } from '../services/auth.service';
import { TestsService } from '../services/tests.service';
import { TopicsService } from '../services/topics.service';
import { QuestionsService } from '../services/questions.service';

// DTO/enums
import { TestDto, TestTypeEnum } from '../dtos/test.dto';
import { TopicDto } from '../dtos/topic.dto';
import { Question, QuestionTypeEnum } from '../dtos/question.dto';
import { PaginatedResponse } from '../dtos/paginated-response';

// Если используете "Manage Access"
import { TestAccessService, IAccessUser } from '../services/test-access.service';
import { UsersService, IUser } from '../services/users.service';

// Функция определения типов вопросов по testType
function getAllowedTypes(tt: TestTypeEnum): QuestionTypeEnum[] {
  if (tt === TestTypeEnum.QuestionsOnly) {
    return [QuestionTypeEnum.SingleChoice, QuestionTypeEnum.MultipleChoice];
  } else if (tt === TestTypeEnum.SurveyOnly) {
    return [QuestionTypeEnum.Survey, QuestionTypeEnum.OpenText];
  } else {
    // Mixed => все 4
    return [
      QuestionTypeEnum.SingleChoice,
      QuestionTypeEnum.MultipleChoice,
      QuestionTypeEnum.Survey,
      QuestionTypeEnum.OpenText
    ];
  }
}

@Component({
  selector: 'app-test-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './test-list.component.html'
})
export class TestListComponent implements OnInit {
  tests: TestDto[] = [];

  // Пагинация
  currentPage = 1;
  pageSize = 5;
  totalPages = 1;
  totalItems = 0;

  // Список топиков
  topics: TopicDto[] = [];

  // Текущий тест
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

  testTypes = [
    { label: 'QuestionsOnly', value: TestTypeEnum.QuestionsOnly },
    { label: 'SurveyOnly',    value: TestTypeEnum.SurveyOnly },
    { label: 'Mixed',         value: TestTypeEnum.Mixed }
  ];

  // Manage Access
  searchText = '';
  searchResults: IUser[] = [];
  currentAccessUsers: IAccessUser[] = [];

  // Manage Questions
  candidateQuestions: Question[] = [];
  testQuestions: Question[] = [];

  constructor(
    public authService: AuthService,
    private testsService: TestsService,
    private topicsService: TopicsService,
    private questionsService: QuestionsService,
    private testAccessService: TestAccessService,
    private usersService: UsersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTests();
  }

  loadTests(): void {
    this.testsService.getAllTests(this.currentPage, this.pageSize).subscribe({
      next: (res: PaginatedResponse<TestDto>) => {
        this.tests = res.items;
        this.totalItems = res.totalItems;
        this.totalPages = res.totalPages;
      },
      error: (err: any) => console.error('Error loading tests', err)
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

  // ========================
  // CREATE / EDIT
  // ========================
  loadTopics(): void {
    this.topicsService.getAll().subscribe({
      next: (res: TopicDto[]) => this.topics = res,
      error: (err: any) => console.error('Error loading topics', err)
    });
  }

  openCreateModal(): void {
    this.isNew = true;
    this.currentTest = {
      name: '',
      countOfQuestions: 1,
      topicId: undefined,
      isPrivate: false,
      isRandom: false,
      testType: TestTypeEnum.QuestionsOnly,
      timeLimitMinutes: null
    };
    this.loadTopics();
    this.showModal('testModal');
  }

  openEditModal(t: TestDto): void {
    this.isNew = false;
    this.currentTest = { ...t };
    if (this.currentTest.isPrivate == null) {
      this.currentTest.isPrivate = false;
    }
    if (this.currentTest.isRandom == null) {
      this.currentTest.isRandom = false;
    }
    if (this.currentTest.testType == null) {
      this.currentTest.testType = TestTypeEnum.QuestionsOnly;
    }
    this.loadTopics();
    this.showModal('testModal');
  }

  saveTest(): void {
    if (!this.currentTest.name) {
      alert('Test name is required!');
      return;
    }
    if (!this.currentTest.countOfQuestions || this.currentTest.countOfQuestions <= 0) {
      alert('CountOfQuestions must be > 0');
      return;
    }

    const name = this.currentTest.name!;
    const count = this.currentTest.countOfQuestions!;
    const topicId = this.currentTest.topicId;
    const isPrivate = !!this.currentTest.isPrivate;
    const isRandom = !!this.currentTest.isRandom;
    const testType = this.currentTest.testType ?? TestTypeEnum.QuestionsOnly;
    const timeLimit = this.currentTest.timeLimitMinutes != null
      ? Number(this.currentTest.timeLimitMinutes)
      : undefined;

    if (this.isNew) {
      // CREATE
      this.testsService.createTest(
        name, count, topicId, isPrivate,
        isRandom, testType, timeLimit
      ).subscribe({
        next: (created: TestDto) => {
          this.hideModal('testModal');
          this.loadTests();
          if (isPrivate && created.id) {
            this.currentTest = created;
            this.openAccessModal();
          }
        },
        error: (err: any) => console.error('Error creating test', err)
      });
    } else {
      // UPDATE
      if (!this.currentTest.id) return;
      this.testsService.updateTest(
        this.currentTest.id,
        name, count, topicId,
        isPrivate, isRandom, testType, timeLimit
      ).subscribe({
        next: (updated: TestDto) => {
          this.hideModal('testModal');
          this.loadTests();
        },
        error: (err: any) => console.error('Error updating test', err)
      });
    }
  }

  deleteTest(t: TestDto): void {
    if (!confirm(`Delete test "${t.name}"?`)) return;
    this.testsService.deleteTest(t.id).subscribe({
      next: () => this.loadTests(),
      error: (err: any) => console.error('Error deleting test', err)
    });
  }

  onStartTest(t: TestDto): void {
    this.router.navigate(['/start-test', t.id]);
  }

  // ========================
  // MANAGE ACCESS (private)
  // ========================
  openAccessModal(): void {
    if (!this.currentTest.id) return;
    this.searchText = '';
    this.searchResults = [];
    this.loadAccessList(this.currentTest.id);
    this.showModal('accessModal');
  }

  loadAccessList(testId: number): void {
    this.testAccessService.getUsersForTest(testId).subscribe({
      next: (users: IAccessUser[]) => {
        this.currentAccessUsers = users;
      },
      error: (err: any) => console.error('Error loading access list', err)
    });
  }

  onSearchUsers(): void {
    const s = this.searchText.trim();
    if (!s) {
      this.searchResults = [];
      return;
    }
    this.usersService.searchUsers(s).subscribe({
      next: (list: IUser[]) => (this.searchResults = list),
      error: (err: any) => console.error('Error searching users', err)
    });
  }

  addAccess(userId: string): void {
    if (!this.currentTest.id) return;
    this.testAccessService.addAccess(this.currentTest.id, userId).subscribe({
      next: () => this.loadAccessList(this.currentTest.id!),
      error: (err: any) => console.error('Error adding access', err)
    });
  }

  removeAccess(userId: string): void {
    if (!this.currentTest.id) return;
    this.testAccessService.removeAccess(this.currentTest.id, userId).subscribe({
      next: () => this.loadAccessList(this.currentTest.id!),
      error: (err: any) => console.error('Error removing access', err)
    });
  }

  // ========================
  // MANAGE QUESTIONS
  // ========================
  openManageQuestions(t: TestDto): void {
    if (t.isRandom) {
      alert('This test is random — cannot manually manage questions.');
      return;
    }
    this.currentTest = { ...t };
    this.loadManageQuestionsData(t);
    this.showModal('manageQuestionsModal');
  }
  private loadManageQuestionsData(t: TestDto): void {
    // 1) Загружаем уже связанные вопросы (как раньше)
    this.testsService.getTestQuestions(t.id).subscribe({
      next: (qList: Question[]) => {
        this.testQuestions = qList;
      },
      error: (err: any) => {
        // Если 404 => нет вопросов
        if (err.status === 404) {
          this.testQuestions = [];
        } else {
          console.error('Error getTestQuestions', err);
        }
      }
    });
  
    // 2) Вместо questionsService.getAllByTopic(...) → вызываем getCandidateQuestions
    this.testsService.getCandidateQuestions(t.id).subscribe({
      next: (candQ: Question[]) => {
        this.candidateQuestions = candQ;
      },
      error: (err: any) => {
        console.error('Error loading candidate questions', err);
        this.candidateQuestions = [];
      }
    });
  }
  

  addQuestionToTest(questionId: number): void {
    if (!this.currentTest.id) return;
    this.testsService.addQuestionToTest(this.currentTest.id, questionId).subscribe({
      next: (updatedTest: TestDto) => {
        if (updatedTest.testQuestions) {
          this.testQuestions = updatedTest.testQuestions
            .filter(tq => tq.question != null)
            .map(tq => tq.question!);
        }
      },
      error: (err: any) => console.error('Error adding question', err)
    });
  }

  removeQuestionFromTest(questionId: number): void {
    if (!this.currentTest.id) return;
    this.testsService.removeQuestionFromTest(this.currentTest.id, questionId).subscribe({
      next: (updatedTest: TestDto) => {
        if (updatedTest.testQuestions) {
          this.testQuestions = updatedTest.testQuestions
            .filter(tq => tq.question != null)
            .map(tq => tq.question!);
        }
      },
      error: (err: any) => console.error('Error removing question', err)
    });
  }

  openCreateQuestionModal(): void {
    // здесь вы можете открыть свою модалку CreateQuestion
  }

  // ========================
  // Bootstrap modals
  // ========================
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
