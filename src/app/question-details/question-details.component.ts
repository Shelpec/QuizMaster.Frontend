import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { QuestionsService, Question } from '../services/questions.service';

@Component({
  selector: 'app-question-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './question-details.component.html'
})
export class QuestionDetailsComponent implements OnInit {
  questionId!: number;       // id из маршрута
  question?: Question;       // загруженный вопрос

  constructor(
    private route: ActivatedRoute,
    private questionsService: QuestionsService
  ) {}

  ngOnInit(): void {
    // Считываем id из URL, например /questions/1001
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.questionId = +idParam; // строку -> число
        this.loadQuestion();
      }
    });
  }

  loadQuestion() {
    this.questionsService.getQuestion(this.questionId).subscribe({
      next: (data) => {
        this.question = data;
        console.log('Loaded question details:', data);
      },
      error: (err) => console.error('Error loading question details', err)
    });
  }
}
