// src/app/services/analytics.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TestAnalyticsWithHistoryDto } from '../dtos/test-analytics.dto';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private baseUrl = 'https://localhost:44336/api/Analytics';

  constructor(private http: HttpClient) {}

  getTestAnalyticsWithHistory(testId: number): Observable<TestAnalyticsWithHistoryDto> {
    return this.http.get<TestAnalyticsWithHistoryDto>(`${this.baseUrl}/full/${testId}`);
  }
}
