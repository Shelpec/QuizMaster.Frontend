import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../services/analytics.service';
import { TestAnalyticsWithHistoryDto, UserTestHistoryDto } from '../dtos/test-analytics.dto';
import { FormsModule } from '@angular/forms';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-test-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxChartsModule],
  templateUrl: './test-analytics.component.html',
  styleUrls: ['./test-analytics.component.scss']
})
export class TestAnalyticsComponent implements OnInit {

  view: [number, number] = [400, 250]; // Увеличен размер диаграммы
  colorScheme: Color = {
    name: 'customScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#28a745', '#dc3545']
  };

  data = [
    { name: 'Правильные', value: 0 }, // Динамически обновляемое значение
    { name: 'Неправильные', value: 0 } // Динамически обновляемое значение
  ];

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

        const avgScore = res.averageScorePercent || 0; // Средний балл в процентах

        // Обновляем данные диаграммы
        this.data = [
          { name: 'Правильные', value: avgScore },
          { name: 'Неправильные', value: 100 - avgScore }
        ];

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

  // Подсветка правильных и неправильных ответов
  getAnswerClass(ans: { isCorrect: boolean; isChosen: boolean }): string {
    if (!ans.isChosen) return '';
    return ans.isCorrect ? 'selected-correct' : 'selected-wrong';
  }

  getTextAnswerClass(ans: { userTextAnswer?: string; isCorrect?: boolean }): string {
    return ans.isCorrect === false ? 'selected-wrong' : 'selected-correct';
  }

}
