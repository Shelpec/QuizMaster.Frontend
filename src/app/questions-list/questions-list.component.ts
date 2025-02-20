import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { QuestionsService } from '../services/questions.service';
import { TopicsService } from '../services/topics.service';
import { CategoriesService } from '../services/categories.service';

import { QuestionTypeEnum } from '../enums/question-type.enum';
import { Question } from '../dtos/question.dto';
import { TopicDto } from '../dtos/topic.dto';
import { CategoryDto } from '../dtos/category.dto';

// Важно: 
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-questions-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './questions-list.component.html',
  styleUrls: ['./questions-list.component.scss']
})
export class QuestionsListComponent implements OnInit {

  // ============================
  // 1) Список вопросов + пагинация
  // ============================
  questions: Question[] = [];
  currentPage = 1;
  pageSize = 5;
  totalPages = 1;
  totalItems = 0;

  // Поиск по ID
  searchId: number | null = null;

  // ============================
  // 2) Модальное окно тем
  // ============================
  showTopicsModal = false;
  topics: TopicDto[] = [];
  isTopicNew = false;
  currentTopic: Partial<TopicDto> = {
    name: '',
    categoryId: 0
  };

  // ============================
  // 3) Модальное окно категорий
  // ============================
  showCategoriesModal = false;
  categories: CategoryDto[] = []; // Список всех категорий
  isCategoryNew = false;
  currentCategory: Partial<CategoryDto> = {
    name: ''
  };

  // ============================
  // 4) Create / Edit Question
  // ============================
  isNew = false;
  currentQuestion: Partial<Question> = {
    text: '',
    topicId: undefined,
    questionType: QuestionTypeEnum.SingleChoice,
    correctTextAnswer: '',
    answerOptions: []
  };

  // Список типов вопроса
  questionTypes = [
    { value: QuestionTypeEnum.SingleChoice, label: 'SingleChoice' },
    { value: QuestionTypeEnum.MultipleChoice, label: 'MultipleChoice' },
    { value: QuestionTypeEnum.Survey, label: 'Survey' },
    { value: QuestionTypeEnum.OpenText, label: 'OpenText' }
  ];

  // Нужен, чтобы в шаблоне работать: *ngIf="currentQuestion.questionType !== questionTypeEnum.Survey"
  public questionTypeEnum = QuestionTypeEnum;

  constructor(
    public authService: AuthService,
    private questionsService: QuestionsService,
    private topicsService: TopicsService,
    private categoriesService: CategoriesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAllQuestions();
  }

  // ============================
  // Методы вопросов
  // ============================
  loadAllQuestions(): void {
    this.questionsService.getAllQuestions(this.currentPage, this.pageSize)
      .subscribe({
        next: (res) => {
          this.questions = res.items;
          this.totalPages = res.totalPages;
          this.totalItems = res.totalItems;
        },
        error: (err) => console.error('Error loading questions', err)
      });
  }

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

  goToTests(): void {
    this.router.navigate(['/tests']);
  }

  goToHistory(): void {
    this.router.navigate(['/history-user-tests']);
  }

  goToQuestion(): void {
    if (this.searchId) {
      this.router.navigate(['/questions', this.searchId]);
    }
  }

  // ============================
  // CREATE / EDIT Question
  // ============================
  openCreateModal(): void {
    this.isNew = true;
    this.currentQuestion = {
      text: '',
      topicId: undefined,
      questionType: QuestionTypeEnum.SingleChoice,
      correctTextAnswer: '',
      answerOptions: [
        { id: 0, text: '', isCorrect: false },
        { id: 0, text: '', isCorrect: false }
      ]
    };

    // Подгружаем темы (если хотите при создании вопроса видеть актуальный список)
    this.loadTopics();
  }

  openEditModal(q: Question): void {
    this.isNew = false;
    this.currentQuestion = {
      id: q.id,
      text: q.text,
      topicId: q.topicId,
      questionType: q.questionType ?? QuestionTypeEnum.SingleChoice,
      correctTextAnswer: q.correctTextAnswer ?? '',
      answerOptions: q.answerOptions.map(a => ({ ...a }))
    };
    this.loadTopics();
  }

  isOpenTextType(): boolean {
    return this.currentQuestion.questionType === QuestionTypeEnum.OpenText;
  }

  shouldShowAnswerOptions(): boolean {
    return this.currentQuestion.questionType !== QuestionTypeEnum.OpenText;
  }

  onIsCorrectChange(index: number): void {
    if (this.currentQuestion.questionType === QuestionTypeEnum.SingleChoice) {
      this.currentQuestion.answerOptions?.forEach((ans, i) => {
        if (i !== index) {
          ans.isCorrect = false;
        }
      });
    }
  }

  addAnswerOption(): void {
    this.currentQuestion.answerOptions?.push({
      id: 0,
      text: '',
      isCorrect: false
    });
  }

  saveQuestion(): void {
    if (!this.currentQuestion.text || !this.currentQuestion.text.trim()) {
      alert('Question text is required!');
      return;
    }

    // Удаляем пустые варианты
    if (this.currentQuestion.answerOptions) {
      this.currentQuestion.answerOptions = this.currentQuestion.answerOptions.filter(
        a => a.text && a.text.trim() !== ''
      );
    }

    const questionType = this.currentQuestion.questionType ?? QuestionTypeEnum.SingleChoice;

    const dto: any = {
      text: this.currentQuestion.text,
      topicId: this.currentQuestion.topicId ?? 0,
      questionType: questionType,
      correctTextAnswer: null,
      answerOptions: []
    };

    if (questionType === QuestionTypeEnum.OpenText) {
      dto.correctTextAnswer = this.currentQuestion.correctTextAnswer ?? '';
    } else {
      dto.answerOptions = this.currentQuestion.answerOptions?.map(a => ({
        id: a.id,
        text: a.text,
        isCorrect: (questionType === QuestionTypeEnum.Survey) ? false : (a.isCorrect ?? false)
      })) || [];
    }

    if (this.isNew) {
      this.questionsService.createQuestion(dto).subscribe({
        next: () => this.loadAllQuestions(),
        error: (err) => console.error('Error creating question', err)
      });
    } else {
      if (!this.currentQuestion.id) return;
      this.questionsService.updateQuestion(this.currentQuestion.id, dto).subscribe({
        next: () => this.loadAllQuestions(),
        error: (err) => console.error('Error updating question', err)
      });
    }
  }

  deleteQuestion(q: Question): void {
    if (!confirm(`Delete question "${q.text}"?`)) return;
    this.questionsService.deleteQuestion(q.id).subscribe({
      next: () => this.loadAllQuestions(),
      error: (err) => console.error('Error deleting question', err)
    });
  }

  // ============================
  // MANAGE TOPICS
  // ============================
  openTopicsModal(): void {
    this.showTopicsModal = true;
    this.loadTopics();
    // А также загрузить категории, если нужно показать их внутри?
    this.loadCategories();
  }

  closeTopicsModal(): void {
    this.showTopicsModal = false;
  }

  loadTopics(): void {
    this.topicsService.getAll().subscribe({
      next: (res) => this.topics = res,
      error: (err) => console.error('Error loading topics', err)
    });
  }

  newTopic(): void {
    this.isTopicNew = true;
    this.currentTopic = { name: '', categoryId: 0 };
  }

  editTopic(t: TopicDto): void {
    this.isTopicNew = false;
    this.currentTopic = {
      id: t.id,
      name: t.name,
      categoryId: t.categoryId
    };
  }

  saveTopic(): void {
    if (!this.currentTopic.name || !this.currentTopic.name.trim()) {
      alert('Topic name is required!');
      return;
    }
    // По умолчанию можно ставить categoryId=0, если не выбрали
    const dto = {
      name: this.currentTopic.name.trim(),
      categoryId: this.currentTopic.categoryId ?? 0
    };

    if (this.isTopicNew) {
      this.topicsService.create(dto).subscribe({
        next: () => {
          this.loadTopics();
          console.log('Topic created successfully');
        },
        error: (err) => console.error('Error creating topic', err)
      });
    } else {
      if (!this.currentTopic.id) return;
      this.topicsService.update(this.currentTopic.id, dto).subscribe({
        next: () => {
          this.loadTopics();
          console.log('Topic updated successfully');
        },
        error: (err) => console.error('Error updating topic', err)
      });
    }
  }

  deleteTopic(t: TopicDto): void {
    if (!confirm(`Delete topic "${t.name}"?`)) return;
    this.topicsService.delete(t.id).subscribe({
      next: () => this.loadTopics(),
      error: (err) => console.error('Error deleting topic', err)
    });
  }

  // ============================
  // MANAGE CATEGORIES
  // ============================
  openCategoriesModal(): void {
    this.showCategoriesModal = true;
    this.loadCategories();
  }

  closeCategoriesModal(): void {
    this.showCategoriesModal = false;
  }

  loadCategories(): void {
    this.categoriesService.getAll().subscribe({
      next: (res) => this.categories = res,
      error: (err) => console.error('Error loading categories', err)
    });
  }

  newCategory(): void {
    this.isCategoryNew = true;
    this.currentCategory = { name: '' };
  }

  editCategory(c: CategoryDto): void {
    this.isCategoryNew = false;
    this.currentCategory = {
      id: c.id,
      name: c.name
    };
  }

  saveCategory(): void {
    if (!this.currentCategory.name || !this.currentCategory.name.trim()) {
      alert('Category name is required!');
      return;
    }

    if (this.isCategoryNew) {
      const dto = { name: this.currentCategory.name.trim() };
      this.categoriesService.create(dto).subscribe({
        next: () => {
          this.loadCategories();
          console.log('Category created');
        },
        error: (err) => console.error('Error creating category', err)
      });
    } else {
      if (!this.currentCategory.id) return;
      const dto = { name: this.currentCategory.name.trim() };
      this.categoriesService.update(this.currentCategory.id, dto).subscribe({
        next: () => {
          this.loadCategories();
          console.log('Category updated');
        },
        error: (err) => console.error('Error updating category', err)
      });
    }
  }

  deleteCategory(c: CategoryDto): void {
    if (!confirm(`Delete category "${c.name}"?`)) return;
    this.categoriesService.delete(c.id).subscribe({
      next: () => {
        this.loadCategories();
        console.log('Category deleted');
      },
      error: (err) => console.error('Error deleting category', err)
    });
  }
}
