import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // нужно для ngModel
import { QuestionsService, Question, CreateQuestionDto, UpdateQuestionDto } from '../services/questions.service';

@Component({
  selector: 'app-questions-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './questions-list.component.html',
  styleUrls: ['./questions-list.component.css']
})
export class QuestionsListComponent implements OnInit {
  questions: Question[] = [];

  // Для модального окна
  isNew: boolean = false;
  currentQuestion: Partial<Question> = {
    text: '',
    answerOptions: []
  };

  constructor(private questionsService: QuestionsService) {}

  ngOnInit(): void {
    this.loadAllQuestions();
  }

  loadAllQuestions() {
    this.questionsService.getAllQuestions().subscribe({
      next: (data) => {
        this.questions = data;
        console.log('Questions:', data);
      },
      error: (err) => {
        console.error('Error loading questions', err);
      }
    });
  }

  // Открыть модалку для создания
  openCreateModal() {
    this.isNew = true;
    this.currentQuestion = {
      text: '',
      answerOptions: [
        {
          text: '', isCorrect: false,
          id: 0
        },
        {
          text: '', isCorrect: false,
          id: 0
        }
      ]
    };
  }

  // Открыть модалку для редактирования
  openEditModal(q: Question) {
    this.isNew = false;
    this.currentQuestion = {
      id: q.id,
      text: q.text,
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
      // CREATE
      const dto: CreateQuestionDto = {
        text: this.currentQuestion.text!,
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
      // UPDATE
      if (!this.currentQuestion.id) return;

      const dto: UpdateQuestionDto = {
        text: this.currentQuestion.text!,
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
      text: '', isCorrect: false,
      id: 0
    });
  }
}
