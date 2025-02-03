// src/app/questions-list/questions-list.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestionsService } from '../services/questions.service';
import { Question, CreateQuestionDto, UpdateQuestionDto } from '../dtos/question.dto';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-questions-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './questions-list.component.html',
  styleUrls: ['./questions-list.component.css']
})
export class QuestionsListComponent implements OnInit {
  questions: Question[] = [];
  searchId: number | null = null; // для поля поиска

  // Захардкоженный список тем (Topic):
  topics = [
    { id: 1, name: 'Математика' },
    { id: 2, name: 'География' },
    { id: 3, name: 'История' },
  ];

  // Для модального окна
  isNew: boolean = false;
  currentQuestion: Partial<Question> = {
    text: '',
    answerOptions: []
  };

  constructor(
    private questionsService: QuestionsService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAllQuestions();
  }

  loadAllQuestions() {
    this.questionsService.getAllQuestions().subscribe({
      next: (data) => {
        this.questions = data;
      },
      error: (err) => console.error(err)
    });
  }

  // Поиск по ID => переходим на /questions/{id}
  goToQuestion() {
    if (this.searchId) {
      this.router.navigate(['/questions', this.searchId]);
    }
  }

  // Открыть модалку для создания
  openCreateModal() {
    this.isNew = true;
    this.currentQuestion = {
      text: '',
      topicId: 1, // По умолчанию выберем math
      answerOptions: [
        { text: '', isCorrect: false, id: 0 },
        { text: '', isCorrect: false, id: 0 }
      ]
    };
  }

  // Открыть модалку для редактирования
  openEditModal(q: Question) {
    this.isNew = false;
    // Копируем данные
    this.currentQuestion = {
      id: q.id,
      text: q.text,
      topicId: q.topicId, // <-- берём TopicId
      answerOptions: q.answerOptions.map(a => ({ ...a }))
    };
  }

  // Сохранить (Create/Update)
  saveQuestion() {
    if (!this.currentQuestion.text) {
      alert('Question text is required');
      return;
    }

    // Фильтруем пустые варианты
    this.currentQuestion.answerOptions = this.currentQuestion.answerOptions?.filter(a => a.text?.trim() !== '');

    if (this.isNew) {
      const dto: CreateQuestionDto = {
        text: this.currentQuestion.text!,
        topicId: this.currentQuestion.topicId || 1, // Выбранный topicId
        answerOptions: this.currentQuestion.answerOptions?.map(a => ({
          text: a.text!,
          isCorrect: a.isCorrect ?? false
        })) || []
      };

      this.questionsService.createQuestion(dto).subscribe({
        next: () => this.loadAllQuestions(),
        error: (err) => console.error(err)
      });

    } else {
      if (!this.currentQuestion.id) return;

      const dto: UpdateQuestionDto = {
        text: this.currentQuestion.text!,
        topicId: this.currentQuestion.topicId || 1,
        answerOptions: this.currentQuestion.answerOptions?.map(a => ({
          id: a.id,
          text: a.text!,
          isCorrect: a.isCorrect ?? false
        })) || []
      };

      this.questionsService.updateQuestion(this.currentQuestion.id, dto).subscribe({
        next: () => this.loadAllQuestions(),
        error: (err) => console.error(err)
      });
    }
  }

  // Удалить вопрос
  deleteQuestion(q: Question) {
    if (!confirm(`Delete question: "${q.text}"?`)) return;
    this.questionsService.deleteQuestion(q.id).subscribe({
      next: () => this.loadAllQuestions(),
      error: (err) => console.error(err)
    });
  }

  // Добавить вариант ответа
  addAnswerOption() {
    this.currentQuestion.answerOptions?.push({
      text: '', isCorrect: false, id: 0
    });
  }
}
