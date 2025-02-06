import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { TestsService, TestDto } from '../services/tests.service';
import { TopicsService } from '../services/topics.service';
import { TopicDto } from '../dtos/topic.dto';

import { TestAccessService, IAccessUser } from '../services/test-access.service';
import { UsersService, IUser } from '../services/users.service';

import { PaginatedResponse } from '../dtos/paginated-response';

declare global {
  interface Window {
    bootstrap?: any;
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

  topics: TopicDto[] = [];
  isNew = false;

  currentTest: Partial<TestDto> = {
    name: '',
    countOfQuestions: 1,
    isPrivate: false
  };

  // ============ Manage Access ============
  searchText = '';
  searchResults: IUser[] = [];
  currentAccessUsers: IAccessUser[] = [];

  constructor(
    public authService: AuthService,
    private testsService: TestsService,
    private topicsService: TopicsService,
    private testAccessService: TestAccessService,
    private usersService: UsersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTests();
  }

  loadTests() {
    this.testsService.getAllTests(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.tests = res.items;
        this.totalPages = res.totalPages;
        this.totalItems = res.totalItems;
      },
      error: (err) => console.error('Error loading tests', err)
    });
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadTests();
    }
  }
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadTests();
    }
  }

  // =========================================
  // CREATE / EDIT
  // =========================================
  loadTopics() {
    this.topicsService.getAll().subscribe({
      next: (res) => (this.topics = res),
      error: (err) => console.error(err)
    });
  }

  openCreateModal() {
    this.isNew = true;
    this.currentTest = {
      name: '',
      countOfQuestions: 1,
      topicId: undefined,
      isPrivate: false
    };
    this.loadTopics();

    // Открыть Bootstrap-модалку вручную
    const modalEl = document.getElementById('testModal');
    if (modalEl) {
      const modalObj = (window as any).bootstrap.Modal.getOrCreateInstance(modalEl);
      modalObj.show();
    }
  }

  openEditModal(t: TestDto) {
    this.isNew = false;
    this.currentTest = { ...t };
    if (this.currentTest.isPrivate == null) {
      this.currentTest.isPrivate = false;
    }
    this.loadTopics();

    const modalEl = document.getElementById('testModal');
    if (modalEl) {
      const modalObj = (window as any).bootstrap.Modal.getOrCreateInstance(modalEl);
      modalObj.show();
    }
  }

  saveTest() {
    if (!this.currentTest.name) {
      alert('Test name required!');
      return;
    }
    if (!this.currentTest.countOfQuestions || this.currentTest.countOfQuestions <= 0) {
      alert('CountOfQuestions must be > 0');
      return;
    }

    const isPrivate = !!this.currentTest.isPrivate;

    if (this.isNew) {
      // CREATE
      this.testsService
        .createTest(
          this.currentTest.name!,
          this.currentTest.countOfQuestions!,
          this.currentTest.topicId,
          isPrivate
        )
        .subscribe({
          next: (res) => {
            // Закрываем модалку
            const modalEl = document.getElementById('testModal');
            if (modalEl) {
              const modalObj = (window as any).bootstrap.Modal.getOrCreateInstance(modalEl);
              modalObj.hide();
            }
            // Перезагружаем список
            this.loadTests();

            // Если приватный -> сразу откроем Manage Access
            if (isPrivate && res.id) {
              this.currentTest = res;
              this.openAccessModal();
            }
          },
          error: (err) => console.error('Error creating test', err)
        });

    } else {
      // UPDATE
      if (!this.currentTest.id) return;
      this.testsService
        .updateTest(
          this.currentTest.id,
          this.currentTest.name!,
          this.currentTest.countOfQuestions!,
          this.currentTest.topicId,
          isPrivate
        )
        .subscribe({
          next: (res) => {
            // Закрыть модалку
            const modalEl = document.getElementById('testModal');
            if (modalEl) {
              const modalObj = (window as any).bootstrap.Modal.getOrCreateInstance(modalEl);
              modalObj.hide();
            }
            // Перезагрузим
            this.loadTests();

            // Если хотим -> можно открыть Access
            // if (isPrivate) { ... }
          },
          error: (err) => console.error('Error updating test', err)
        });
    }
  }

  deleteTest(t: TestDto) {
    if (!confirm(`Delete test: "${t.name}"?`)) return;
    this.testsService.deleteTest(t.id).subscribe({
      next: () => this.loadTests(),
      error: (err) => console.error('Error deleting test', err)
    });
  }

  // =========================================
  // START TEST
  // =========================================
  onStartTest(t: TestDto) {
    this.router.navigate(['/start-test', t.id]);
  }

  // =========================================
  // MANAGE ACCESS
  // =========================================
  openAccessModal() {
    const testId = this.currentTest.id;
    if (!testId) return;

    this.searchText = '';
    this.searchResults = [];
    this.loadAccessList(testId);

    const modalEl = document.getElementById('accessModal');
    if (modalEl) {
      const modalObj = (window as any).bootstrap.Modal.getOrCreateInstance(modalEl);
      modalObj.show();
    }
  }

  loadAccessList(testId: number) {
    this.testAccessService.getUsersForTest(testId).subscribe({
      next: (list) => {
        this.currentAccessUsers = list; // IAccessUser[]
      },
      error: (err) => console.error('Error loading access list', err)
    });
  }

  onSearchUsers() {
    const s = this.searchText.trim();
    if (!s) {
      this.searchResults = [];
      return;
    }
    this.usersService.searchUsers(s).subscribe({
      next: (users) => this.searchResults = users,
      error: (err) => console.error('Error searching users', err)
    });
  }

  addAccess(userId: string) {
    const testId = this.currentTest.id;
    if (!testId) return;

    this.testAccessService.addAccess(testId, userId).subscribe({
      next: (res) => {
        // Перезагрузим список
        this.loadAccessList(testId);
      },
      error: (err) => console.error('Error adding access', err)
    });
  }

  removeAccess(userId: string) {
    const testId = this.currentTest.id;
    if (!testId) return;

    this.testAccessService.removeAccess(testId, userId).subscribe({
      next: (res) => {
        this.loadAccessList(testId);
      },
      error: (err) => console.error('Error removing access', err)
    });
  }
}
