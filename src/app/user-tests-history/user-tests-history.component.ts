import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserTestsService } from '../services/user-tests.service';
import { UserTestHistoryDto } from '../dtos/user-test-history.dto';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-user-tests-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-tests-history.component.html',
  styleUrls: ['./user-tests-history.component.scss']
})
export class UserTestsHistoryComponent implements OnInit {
  allUserTests: UserTestHistoryDto[] = [];

  // Поля для поиска
  searchUserTestId: number | null = null;
  searchEmail: string = '';

  // Для разворачивания деталей
  expanded: { [userTestId: number]: boolean } = {};

  // Флаг, показывает — текущий пользователь Админ или нет
  isAdmin = false;

  constructor(
    private userTestsService: UserTestsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadInitialData();
  }

  loadInitialData(): void {
    if (this.isAdmin) {
      // Если админ — загружаем все
      this.loadAllUserTests();
    } else {
      // Если обычный пользователь — грузим только свою историю
      const email = this.authService.getEmail();
      if (email) {
        this.loadHistoryByEmail(email);
      } else {
        // На всякий случай
        this.allUserTests = [];
      }
    }
  }

  loadAllUserTests(): void {
    this.userTestsService.getAllFull().subscribe({
      next: (data) => {
        this.allUserTests = data;
        data.forEach(ut => this.expanded[ut.userTestId] = false);
      },
      error: (err) => {
        console.error('Error loading all user tests', err);
      }
    });
  }

  loadHistoryByEmail(email: string): void {
    this.userTestsService.getByUserEmail(email).subscribe({
      next: (res) => {
        this.allUserTests = res;
        res.forEach(ut => this.expanded[ut.userTestId] = false);
      },
      error: (err) => {
        console.error('Error loading user tests by email', err);
        this.allUserTests = [];
      }
    });
  }

  // Поиск по userTestId (только если мы админ)
  onSearchById(): void {
    if (!this.isAdmin) return; // User не может искать произвольные userTestId

    if (!this.searchUserTestId) {
      alert('Введите userTestId');
      return;
    }
    this.userTestsService.getByIdFull(this.searchUserTestId).subscribe({
      next: (res) => {
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

  // Поиск по email (только если мы админ)
  onSearchByEmail(): void {
    if (!this.isAdmin) return; // User не может смотреть чужой email

    if (!this.searchEmail.trim()) {
      alert('Введите email');
      return;
    }
    this.loadHistoryByEmail(this.searchEmail.trim());
  }

  // Сброс: админ снова увидит все, а user — только свои
  resetSearch(): void {
    this.searchUserTestId = null;
    this.searchEmail = '';
    this.loadInitialData();
  }

  toggleExpand(userTestId: number): void {
    this.expanded[userTestId] = !this.expanded[userTestId];
  }

  deleteUserTest(ut: UserTestHistoryDto): void {
    if (!confirm(`Delete userTestId=${ut.userTestId} for user=${ut.userEmail}?`)) return;
    this.userTestsService.deleteUserTest(ut.userTestId).subscribe({
      next: () => {
        this.allUserTests = this.allUserTests.filter(x => x.userTestId !== ut.userTestId);
      },
      error: (err) => console.error('Error deleting userTest', err)
    });
  }

  getAnswerClass(ans: { isCorrect: boolean; isChosen: boolean; }): string {
    if (!ans.isChosen) return '';
    return ans.isCorrect ? 'selected-correct' : 'selected-wrong';
  }
}
