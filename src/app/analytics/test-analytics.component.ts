// src/app/analytics/test-analytics.component.ts

import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../services/analytics.service';
import { TestAnalyticsWithHistoryDto, UserTestHistoryDto } from '../dtos/test-analytics.dto';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-test-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './test-analytics.component.html',
  styleUrls: ['./test-analytics.component.scss']
})
export class TestAnalyticsComponent implements OnInit {
  @Input() testId!: number;  // получаем ID теста извне
  analyticsData?: TestAnalyticsWithHistoryDto;

  loading = false;
  errorMsg = '';

  // Для управления раскрытием истории
  expandedHistory: { [userTestId: number]: boolean } = {};

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    if (!this.testId) {
      this.errorMsg = 'testId is required!';
      return;
    }
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.loading = true;
    this.analyticsService.getTestAnalyticsWithHistory(this.testId).subscribe({
      next: (res) => {
        this.analyticsData = res;
        this.loading = false;

        // Инициализируем expandedHistory
        res.history.forEach(h => {
          this.expandedHistory[h.userTestId] = false;
        });
      },
      error: (err) => {
        console.error('Error loading analytics', err);
        this.errorMsg = 'Error loading analytics';
        this.loading = false;
      }
    });
  }

  toggleExpandHistory(ut: UserTestHistoryDto) {
    this.expandedHistory[ut.userTestId] = !this.expandedHistory[ut.userTestId];
  }

  // Пример подсветки
  getAnswerClass(ans: { isCorrect: boolean; isChosen: boolean }): string {
    if (!ans.isChosen) return '';
    return ans.isCorrect ? 'selected-correct' : 'selected-wrong';
  }

  getTextAnswerClass(ans: { userTextAnswer?: string; isCorrect?: boolean }): string {
    if (ans.isCorrect === false) {
      return 'selected-wrong';
    }
    return 'selected-correct';
  }
}
