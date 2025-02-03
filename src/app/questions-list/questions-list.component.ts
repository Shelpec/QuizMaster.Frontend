// src/app/questions-list/questions-list.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { QuestionsService } from '../services/questions.service';
import { TopicsService } from '../services/topics.service';

import { Question, CreateQuestionDto, UpdateQuestionDto } from '../dtos/question.dto';
import { TopicDto, CreateTopicDto, UpdateTopicDto } from '../dtos/topic.dto';

@Component({
  selector: 'app-questions-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './questions-list.component.html',
  styleUrls: ['./questions-list.component.css']
})
export class QuestionsListComponent implements OnInit {
  // Список вопросов
  questions: Question[] = [];
  
  // Поле для поиска по ID вопроса
  searchId: number | null = null;

  // ----- Управление топиками (Topics) -----
  showTopicsModal = false;        // Отображать ли модалку «Manage Topics»
  topics: TopicDto[] = [];        // Список тем, полученный с сервера
  isTopicNew = false;             // Режим "создание" или "редактирование"
  currentTopic: Partial<TopicDto> = { name: '' };

  // ----- Управление вопросами (Questions) -----
  isNew: boolean = false;         // Режим создания или редактирования вопроса
  currentQuestion: Partial<Question> = { text: '', answerOptions: [] };

  constructor(
    public authService: AuthService,
    private questionsService: QuestionsService,
    private topicsService: TopicsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Загружаем список вопросов при старте
    this.loadAllQuestions();
  }

  // =========================================
  // Загрузка вопросов
  // =========================================
  loadAllQuestions() {
    this.questionsService.getAllQuestions().subscribe({
      next: (data) => {
        this.questions = data;
        console.log('Questions loaded:', data);
      },
      error: (err) => console.error('Error loading questions', err)
    });
  }

  // =========================================
  // Поиск вопроса по ID
  // =========================================
  goToQuestion() {
    if (this.searchId) {
      this.router.navigate(['/questions', this.searchId]);
    }
  }

  // =========================================
  // Открыть модалку создания нового вопроса
  // =========================================
  openCreateModal() {
    this.isNew = true;
    // Сбрасываем данные вопроса
    this.currentQuestion = {
      text: '',
      topicId: undefined,
      answerOptions: [
        { text: '', isCorrect: false, id: 0 },
        { text: '', isCorrect: false, id: 0 }
      ]
    };
    // Загружаем список тем, чтобы пользователь мог выбрать тему
    this.loadTopics();
  }

  // =========================================
  // Открыть модалку для редактирования вопроса
  // =========================================
  openEditModal(q: Question) {
    this.isNew = false;
    this.currentQuestion = {
      id: q.id,
      text: q.text,
      topicId: q.topicId,
      answerOptions: q.answerOptions.map(a => ({ ...a }))
    };
    // Тоже загрузим список тем, чтобы были актуальные
    this.loadTopics();
  }

  // =========================================
  // Сохранить вопрос (Create/Update)
  // =========================================
  saveQuestion() {
    if (!this.currentQuestion.text) {
      alert('Question text is required');
      return;
    }

    // Удаляем пустые варианты ответа
    this.currentQuestion.answerOptions = this.currentQuestion.answerOptions?.filter(a => a.text?.trim() !== '');

    if (this.isNew) {
      // Создание
      const dto: CreateQuestionDto = {
        text: this.currentQuestion.text!,
        topicId: this.currentQuestion.topicId || 0, // 0, если не выбрали
        answerOptions: this.currentQuestion.answerOptions?.map(a => ({
          text: a.text!,
          isCorrect: a.isCorrect ?? false
        })) || []
      };

      this.questionsService.createQuestion(dto).subscribe({
        next: () => {
          this.loadAllQuestions();
        },
        error: (err) => console.error('Error creating question', err)
      });
    } else {
      // Редактирование
      if (!this.currentQuestion.id) return;

      const dto: UpdateQuestionDto = {
        text: this.currentQuestion.text!,
        topicId: this.currentQuestion.topicId || 0,
        answerOptions: this.currentQuestion.answerOptions?.map(a => ({
          id: a.id,
          text: a.text!,
          isCorrect: a.isCorrect ?? false
        })) || []
      };

      this.questionsService.updateQuestion(this.currentQuestion.id, dto).subscribe({
        next: () => {
          this.loadAllQuestions();
        },
        error: (err) => console.error('Error updating question', err)
      });
    }
  }

  // =========================================
  // Удалить вопрос
  // =========================================
  deleteQuestion(q: Question) {
    if (!confirm(`Delete question: "${q.text}"?`)) return;
    this.questionsService.deleteQuestion(q.id).subscribe({
      next: () => {
        this.loadAllQuestions();
      },
      error: (err) => console.error('Error deleting question', err)
    });
  }

  // Добавить поле варианта ответа
  addAnswerOption() {
    this.currentQuestion.answerOptions?.push({
      text: '', isCorrect: false, id: 0
    });
  }

  // =========================================
  // Управление модалкой "Manage Topics"
  // =========================================
  openTopicsModal() {
    this.showTopicsModal = true;
    this.loadTopics();
  }

  closeTopicsModal() {
    this.showTopicsModal = false;
  }

  loadTopics() {
    this.topicsService.getAll().subscribe({
      next: (data) => {
        this.topics = data;
        console.log('Topics loaded:', data);
      },
      error: (err) => console.error('Error loading topics', err)
    });
  }

  newTopic() {
    this.isTopicNew = true;
    this.currentTopic = { name: '' };
  }

  editTopic(topic: TopicDto) {
    this.isTopicNew = false;
    this.currentTopic = { id: topic.id, name: topic.name };
  }

  saveTopic() {
    if (!this.currentTopic.name) {
      alert('Topic name is required');
      return;
    }

    if (this.isTopicNew) {
      // Создание темы
      const dto: CreateTopicDto = { name: this.currentTopic.name };
      this.topicsService.create(dto).subscribe({
        next: () => {
          // Перезагружаем список тем
          this.loadTopics();
        },
        error: (err) => console.error('Error creating topic', err)
      });
    } else {
      // Редактирование темы
      if (!this.currentTopic.id) return;
      const dto: UpdateTopicDto = { name: this.currentTopic.name! };
      this.topicsService.update(this.currentTopic.id, dto).subscribe({
        next: () => {
          this.loadTopics();
        },
        error: (err) => console.error('Error updating topic', err)
      });
    }
  }

  deleteTopic(topic: TopicDto) {
    if (!confirm(`Delete topic: "${topic.name}"?`)) return;
    this.topicsService.delete(topic.id).subscribe({
      next: () => {
        this.loadTopics();
      },
      error: (err) => console.error('Error deleting topic', err)
    });
  }
}
