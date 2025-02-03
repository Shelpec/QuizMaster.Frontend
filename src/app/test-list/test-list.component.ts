// src/app/test-list/test-list.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  // Список тем, чтобы выбрать при создании/редактировании
  topics: TopicDto[] = [];

  // Модалка Test
  isNew: boolean = false;
  currentTest: Partial<TestDto> = {
    name: '',
    countOfQuestions: 1
  };

  constructor(
    public authService: AuthService,
    private testsService: TestsService,
    private topicsService: TopicsService
  ) {}

  ngOnInit(): void {
    this.loadTests();
  }

  loadTests(): void {
    this.testsService.getAllTests().subscribe({
      next: (data: TestDto[]) => {
        this.tests = data;
        console.log('Tests loaded:', data);
      },
      error: (err: any) => console.error('Error loading tests', err)
    });
  }

  loadTopics(): void {
    this.topicsService.getAll().subscribe({
      next: (res: TopicDto[]) => {
        this.topics = res;
        console.log('Topics for test creation:', res);
      },
      error: (err: any) => console.error('Error loading topics', err)
    });
  }

  // Открыть модалку для создания
  openCreateModal(): void {
    this.isNew = true;
    this.currentTest = {
      name: '',
      countOfQuestions: 1,
      topicId: undefined
    };
    this.loadTopics();
  }

  // Открыть модалку для редактирования
  openEditModal(t: TestDto): void {
    this.isNew = false;
    this.currentTest = { ...t }; // копируем
    this.loadTopics();
  }

  // Сохранить (create/update)
  saveTest(): void {
    if (!this.currentTest.name) {
      alert('Test name required!');
      return;
    }
    if (!this.currentTest.countOfQuestions || this.currentTest.countOfQuestions <= 0) {
      alert('CountOfQuestions must be > 0');
      return;
    }

    if (this.isNew) {
      // create
      this.testsService.createTest(
        this.currentTest.name!,
        this.currentTest.countOfQuestions,
        this.currentTest.topicId
      ).subscribe({
        next: (created: TestDto) => {
          console.log('Created Test:', created);
          this.loadTests();
        },
        error: (err: any) => console.error('Error creating test', err)
      });
    } else {
      // update
      if (!this.currentTest.id) return;
      this.testsService.updateTest(
        this.currentTest.id,
        this.currentTest.name!,
        this.currentTest.countOfQuestions,
        this.currentTest.topicId
      ).subscribe({
        next: (updated: TestDto) => {
          console.log('Updated Test:', updated);
          this.loadTests();
        },
        error: (err: any) => console.error('Error updating test', err)
      });
    }
  }

  deleteTest(t: TestDto): void {
    if (!confirm(`Delete test: "${t.name}"?`)) return;
    this.testsService.deleteTest(t.id).subscribe({
      next: () => this.loadTests(),
      error: (err: any) => console.error('Error deleting test', err)
    });
  }
}
