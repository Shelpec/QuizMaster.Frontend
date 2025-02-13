// src/app/question-details/question-details.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionsService } from '../services/questions.service';
import { Question, UpdateQuestionDto } from '../dtos/question.dto';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { QuestionTypeEnum } from '../enums/question-type.enum';

@Component({
  selector: 'app-question-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './question-details.component.html'
})
export class QuestionDetailsComponent implements OnInit {
  questionId!: number;
  question?: Question;

  // Для редактирования
  isEditing = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private questionsService: QuestionsService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.questionId = +idParam;
        this.loadQuestion();
      }
    });
  }

  loadQuestion() {
    this.questionsService.getQuestion(this.questionId).subscribe({
      next: (data) => {
        this.question = data;
      },
      error: (err) => console.error('Error loading question details', err)
    });
  }

  // Включаем/выключаем режим редактирования
  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

// question-details.component.ts
// Сохраняем изменения
saveChanges() {
  if (!this.question) return;
    
  // Теперь укажем и questionType, и correctTextAnswer
  const dto: UpdateQuestionDto = {
    text: this.question.text,
    questionType: this.question.questionType ?? QuestionTypeEnum.SingleChoice,
    correctTextAnswer: this.question.correctTextAnswer ?? null,
    answerOptions: this.question.answerOptions.map(ans => ({
      id: ans.id,
      text: ans.text,
      isCorrect: ans.isCorrect
    }))
  };

  this.questionsService.updateQuestion(this.questionId, dto).subscribe({
    next: () => {
      this.isEditing = false;
      this.loadQuestion(); 
    },
    error: (err) => console.error(err)
  });
}



  deleteQuestion() {
    if (!confirm(`Delete question: "${this.question?.text}"?`)) return;

    this.questionsService.deleteQuestion(this.questionId).subscribe({
      next: () => {
        // Вернуться на список вопросов
        this.router.navigate(['/questions']);
      },
      error: (err) => console.error(err)
    });
  }

  addAnswer() {
    if (!this.question) return;
    this.question.answerOptions.push({
      id: 0,
      text: '',
      isCorrect: false
    });
  }
}
