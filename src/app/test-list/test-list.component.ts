import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { TestsService, TestDto } from '../services/tests.service';
import { TopicsService } from '../services/topics.service';
import { TopicDto } from '../dtos/topic.dto';

@Component({
  selector: 'app-test-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './test-list.component.html'
})
export class TestListComponent implements OnInit {
  tests: TestDto[] = [];
  topics: TopicDto[] = [];

  isNew = false;
  currentTest: Partial<TestDto> = {
    name: '',
    countOfQuestions: 1
  };

  constructor(
    public authService: AuthService,
    private testsService: TestsService,
    private topicsService: TopicsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTests();
  }

  loadTests() {
    this.testsService.getAllTests().subscribe({
      next: (data: TestDto[]) => {
        this.tests = data;
      },
      error: (err) => console.error('Error loading tests', err)
    });
  }

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
      topicId: undefined
    };
    this.loadTopics();
  }

  openEditModal(t: TestDto) {
    this.isNew = false;
    this.currentTest = { ...t };
    this.loadTopics();
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

    if (this.isNew) {
      this.testsService
        .createTest(
          this.currentTest.name!,
          this.currentTest.countOfQuestions!,
          this.currentTest.topicId
        )
        .subscribe({
          next: () => this.loadTests(),
          error: (err) => console.error('Error creating test', err)
        });
    } else {
      if (!this.currentTest.id) return;
      this.testsService
        .updateTest(
          this.currentTest.id,
          this.currentTest.name!,
          this.currentTest.countOfQuestions!,
          this.currentTest.topicId
        )
        .subscribe({
          next: () => this.loadTests(),
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

  // Обычный пользователь может стартовать тест
  onStartTest(t: TestDto) {
    this.router.navigate(['/start-test', t.id]);
  }
}

