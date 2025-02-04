// src/app/user-tests-history/user-tests-history.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserTestsService } from '../services/user-tests.service';
import { UserTestHistoryDto } from '../dtos/user-test-history.dto';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-user-tests-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-tests-history.component.html',
  styleUrls: ['./user-tests-history.component.scss']
})
export class UserTestsHistoryComponent implements OnInit {

  // Основной массив
  allUserTests: UserTestHistoryDto[] = [];

  // Для поиска по Id
  searchUserTestId: number | null = null;
  // Для поиска по email
  searchEmail: string = '';

  // Для "раскрытия" деталей по каждому userTestId
  expanded: { [userTestId: number]: boolean } = {};

  constructor(private userTestsService: UserTestsService) {}

  ngOnInit(): void {
    // При загрузке показываем все userTest'ы
    this.loadAllUserTests();
  }

  loadAllUserTests(): void {
    this.userTestsService.getAllFull().subscribe({
      next: (data) => {
        this.allUserTests = data;
        // Сбрасываем expanded
        data.forEach(ut => {
          this.expanded[ut.userTestId] = false;
        });
      },
      error: (err) => {
        console.error('Error loading all user tests', err);
      }
    });
  }

  /** Поиск по userTestId */
  onSearchById(): void {
    if (!this.searchUserTestId) {
      alert('Введите userTestId');
      return;
    }
    this.userTestsService.getByIdFull(this.searchUserTestId).subscribe({
      next: (res) => {
        // Получаем ОДИН userTest
        // Преобразуем в массив, чтобы отобразить в том же allUserTests
        this.allUserTests = [res];
        this.expanded = {};
        this.expanded[res.userTestId] = false;
      },
      error: (err) => {
        console.error('Error searching by Id', err);
        alert('UserTest not found or error');
        this.allUserTests = [];
      }
    });
  }

  /** Поиск по email */
  onSearchByEmail(): void {
    if (!this.searchEmail.trim()) {
      alert('Введите email');
      return;
    }
    this.userTestsService.getByUserEmail(this.searchEmail.trim()).subscribe({
      next: (res) => {
        this.allUserTests = res;
        this.expanded = {};
        res.forEach(ut => {
          this.expanded[ut.userTestId] = false;
        });
      },
      error: (err) => {
        console.error('Error searching by email', err);
        alert('No results or error');
        this.allUserTests = [];
      }
    });
  }

  /** Сбросить поиск => показать все */
  resetSearch(): void {
    this.searchUserTestId = null;
    this.searchEmail = '';
    this.loadAllUserTests();
  }

  toggleExpand(userTestId: number): void {
    this.expanded[userTestId] = !this.expanded[userTestId];
  }

  /** Удалить userTest */
  deleteUserTest(ut: UserTestHistoryDto): void {
    if (!confirm(`Delete userTestId=${ut.userTestId} for user=${ut.userEmail}?`)) return;
    this.userTestsService.deleteUserTest(ut.userTestId).subscribe({
      next: () => {
        // Удалить из массива
        this.allUserTests = this.allUserTests.filter(x => x.userTestId !== ut.userTestId);
      },
      error: (err) => console.error('Error deleting userTest', err)
    });
  }

  getAnswerClass(ans: {isCorrect: boolean; isChosen: boolean;}): string {
    if (!ans.isChosen) {
      return '';
    }
    return ans.isCorrect ? 'selected-correct' : 'selected-wrong';
  }
}
