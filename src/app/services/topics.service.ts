import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TopicDto, CreateTopicDto, UpdateTopicDto } from '../dtos/topic.dto';

@Injectable({
  providedIn: 'root'
})
export class TopicsService {
  private baseUrl = 'https://localhost:44336/api/topic';

  constructor(private http: HttpClient) {}

  getAll(): Observable<TopicDto[]> {
    return this.http.get<TopicDto[]>(this.baseUrl);
  }

  getById(id: number): Observable<TopicDto> {
    return this.http.get<TopicDto>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateTopicDto): Observable<TopicDto> {
    return this.http.post<TopicDto>(this.baseUrl, dto);
  }

  update(id: number, dto: UpdateTopicDto): Observable<TopicDto> {
    return this.http.put<TopicDto>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getByCategoryId(categoryId: number): Observable<TopicDto[]> {
    return this.http.get<TopicDto[]>(`${this.baseUrl}/by-category/${categoryId}`);
  }
  
}
