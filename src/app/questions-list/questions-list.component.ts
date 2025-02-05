import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { QuestionsService } from '../services/questions.service';
import { TopicsService } from '../services/topics.service';

import { Question } from '../dtos/question.dto';
import { TopicDto } from '../dtos/topic.dto';

@Component({
  selector: 'app-questions-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './questions-list.component.html',
  styleUrls: ['./questions-list.component.scss']
})
export class QuestionsListComponent implements OnInit {
  questions: Question[] = [];

  // Пагинация
  currentPage = 1;
  pageSize = 5;  // Можно изменить на 10
  totalPages = 1;
  totalItems = 0;

  // Поиск по ID
  searchId: number | null = null;

  // Topics Modal
  showTopicsModal = false;
  topics: TopicDto[] = [];
  isTopicNew = false;
  currentTopic: Partial<TopicDto> = { name: '' };

  // Question Create/Update
  isNew = false;
  currentQuestion: Partial<Question> = {
    text: '',
    answerOptions: []
  };

  constructor(
    public authService: AuthService,
    private questionsService: QuestionsService,
    private topicsService: TopicsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAllQuestions();
  }

  loadAllQuestions(): void {
    this.questionsService.getAllQuestions(this.currentPage, this.pageSize)
      .subscribe({
        next: (res) => {
          // res = PaginatedResponse<Question>
          this.questions = res.items;
          this.totalPages = res.totalPages;
          this.totalItems = res.totalItems;
        },
        error: (err) => console.error('Error loading questions', err)
      });
  }

  // Переход к предыдущей/следующей странице
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadAllQuestions();
    }
  }
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadAllQuestions();
    }
  }

  // Дополнительно: перейти к произвольной странице
  goToPage(p: number): void {
    if (p >= 1 && p <= this.totalPages) {
      this.currentPage = p;
      this.loadAllQuestions();
    }
  }

  // Остальная логика (CRUD) остается прежней
  goToTests(): void {
    this.router.navigate(['/tests']);
  }

  goToQuestion(): void {
    if (this.searchId) {
      this.router.navigate(['/questions', this.searchId]);
    }
  }

  openCreateModal(): void {
    this.isNew = true;
    this.currentQuestion = {
      text: '',
      topicId: undefined,
      answerOptions: [
        { text: '', isCorrect: false, id: 0 },
        { text: '', isCorrect: false, id: 0 }
      ]
    };
    this.loadTopics();
  }

  openEditModal(q: Question): void {
    this.isNew = false;
    this.currentQuestion = {
      id: q.id,
      text: q.text,
      topicId: q.topicId,
      answerOptions: q.answerOptions.map(a => ({ ...a }))
    };
    this.loadTopics();
  }

  saveQuestion(): void {
    if (!this.currentQuestion.text) {
      alert('Question text is required');
      return;
    }
    this.currentQuestion.answerOptions = this.currentQuestion.answerOptions?.filter(
      a => a.text?.trim() !== ''
    );
    if (this.isNew) {
      const dto = {
        text: this.currentQuestion.text!,
        topicId: this.currentQuestion.topicId || 0,
        answerOptions: this.currentQuestion.answerOptions?.map(a => ({
          text: a.text!,
          isCorrect: a.isCorrect ?? false
        })) || []
      };
      this.questionsService.createQuestion(dto).subscribe({
        next: () => {
          // Перезагрузим
          this.loadAllQuestions();
        },
        error: (err) => console.error('Error creating question', err)
      });
    } else {
      if (!this.currentQuestion.id) return;
      const dto = {
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

  deleteQuestion(q: Question): void {
    if (!confirm(`Delete question: "${q.text}"?`)) return;
    this.questionsService.deleteQuestion(q.id).subscribe({
      next: () => this.loadAllQuestions(),
      error: (err) => console.error('Error deleting question', err)
    });
  }

  addAnswerOption(): void {
    this.currentQuestion.answerOptions?.push({
      text: '',
      isCorrect: false,
      id: 0
    });
  }

  openTopicsModal(): void {
    this.showTopicsModal = true;
    this.loadTopics();
  }
  closeTopicsModal(): void {
    this.showTopicsModal = false;
  }
  loadTopics(): void {
    this.topicsService.getAll().subscribe({
      next: (data) => this.topics = data,
      error: (err) => console.error('Error loading topics', err)
    });
  }
  newTopic(): void {
    this.isTopicNew = true;
    this.currentTopic = { name: '' };
  }
  editTopic(topic: TopicDto): void {
    this.isTopicNew = false;
    this.currentTopic = { id: topic.id, name: topic.name };
  }
  saveTopic(): void {
    if (!this.currentTopic.name) {
      alert('Topic name is required');
      return;
    }
    if (this.isTopicNew) {
      const dto = { name: this.currentTopic.name };
      this.topicsService.create(dto).subscribe({
        next: () => this.loadTopics(),
        error: (err) => console.error('Error creating topic', err)
      });
    } else {
      if (!this.currentTopic.id) return;
      const dto = { name: this.currentTopic.name! };
      this.topicsService.update(this.currentTopic.id, dto).subscribe({
        next: () => this.loadTopics(),
        error: (err) => console.error('Error updating topic', err)
      });
    }
  }
  deleteTopic(topic: TopicDto): void {
    if (!confirm(`Delete topic: "${topic.name}"?`)) return;
    this.topicsService.delete(topic.id).subscribe({
      next: () => this.loadTopics(),
      error: (err) => console.error('Error deleting topic', err)
    });
  }

  goToHistory(): void {
    this.router.navigate(['/history-user-tests']);
  }
}
