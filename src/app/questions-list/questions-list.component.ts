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
    public authService: AuthService,        // <-- используем в шаблоне
    private questionsService: QuestionsService,
    private topicsService: TopicsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAllQuestions();
  }

  goToTests(): void {
    this.router.navigate(['/tests']);
  }

  loadAllQuestions(): void {
    this.questionsService.getAllQuestions().subscribe({
      next: (data) => {
        this.questions = data;
      },
      error: (err) => {
        console.error('Error loading questions', err);
      }
    });
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
    // Фильтр пустых вариантов
    this.currentQuestion.answerOptions = this.currentQuestion.answerOptions?.filter(
      a => a.text?.trim() !== ''
    );

    if (this.isNew) {
      // Create
      const dto = {
        text: this.currentQuestion.text!,
        topicId: this.currentQuestion.topicId || 0,
        answerOptions: this.currentQuestion.answerOptions?.map(a => ({
          text: a.text!,
          isCorrect: a.isCorrect ?? false
        })) || []
      };
      this.questionsService.createQuestion(dto).subscribe({
        next: () => this.loadAllQuestions(),
        error: (err) => console.error('Error creating question', err)
      });
    } else {
      // Update
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
        next: () => this.loadAllQuestions(),
        error: (err) => console.error('Error updating question', err)
      });
    }
  }

  deleteQuestion(q: Question): void {
    if (!confirm(`Delete question: "${q.text}"?`)) return;
    this.questionsService.deleteQuestion(q.id).subscribe({
      next: () => {
        this.loadAllQuestions();
      },
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

  // Topics
  openTopicsModal(): void {
    this.showTopicsModal = true;
    this.loadTopics();
  }

  closeTopicsModal(): void {
    this.showTopicsModal = false;
  }

  loadTopics(): void {
    this.topicsService.getAll().subscribe({
      next: (data) => {
        this.topics = data;
      },
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
      // CREATE
      const dto = { name: this.currentTopic.name };
      this.topicsService.create(dto).subscribe({
        next: () => this.loadTopics(),
        error: (err) => console.error('Error creating topic', err)
      });
    } else {
      // UPDATE
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

