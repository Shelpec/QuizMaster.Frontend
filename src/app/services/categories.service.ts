import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoryDto, CreateCategoryDto, UpdateCategoryDto } from '../dtos/category.dto';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private baseUrl = 'https://localhost:44336/api/categories';

  constructor(private http: HttpClient) {}

  getAll(): Observable<CategoryDto[]> {
    return this.http.get<CategoryDto[]>(this.baseUrl);
  }

  getById(id: number): Observable<CategoryDto> {
    return this.http.get<CategoryDto>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateCategoryDto): Observable<CategoryDto> {
    return this.http.post<CategoryDto>(this.baseUrl, dto);
  }

  update(id: number, dto: UpdateCategoryDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
