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
  // Пагинация
  currentPage = 1;
  pageSize = 5;
  totalPages = 1;
  totalItems = 0;

  allUserTests: UserTestHistoryDto[] = [];

  // Поля для поиска (только для Admin)
  searchUserTestId: number | null = null;
  searchEmail: string = '';

  expanded: { [userTestId: number]: boolean } = {};

  isAdmin = false;
  private currentUserEmail: string | null = null;

  constructor(
    private userTestsService: UserTestsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.currentUserEmail = this.authService.getEmail();
    this.loadData();
  }

  loadData(): void {
    if (this.isAdmin) {
      // admin -> getAllFull(page, pageSize)
      this.userTestsService.getAllFull(this.currentPage, this.pageSize).subscribe({
        next: (res) => {
          // PaginatedResponse<UserTestHistoryDto>
          this.allUserTests = res.items;
          this.totalPages = res.totalPages;
          this.totalItems = res.totalItems;

          res.items.forEach(ut => {
            this.expanded[ut.userTestId] = false;
          });
        },
        error: (err) => console.error('Error loading all user tests', err)
      });
    } else {
      // обычный пользователь -> getByUserEmail
      if (this.currentUserEmail) {
        this.userTestsService.getByUserEmail(this.currentUserEmail, this.currentPage, this.pageSize)
          .subscribe({
            next: (res) => {
              // res = PaginatedResponse<UserTestHistoryDto[]>
              const itemsAny = (res as any).items || [];
              this.allUserTests = itemsAny;
              this.totalPages = (res as any).totalPages;
              this.totalItems = (res as any).totalItems;

              this.allUserTests.forEach(ut => {
                this.expanded[ut.userTestId] = false;
              });
            },
            error: (err) => {
              console.error('Error loading user tests by email', err);
              this.allUserTests = [];
            }
          });
      }
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadData();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadData();
    }
  }

  onSearchById(): void {
    if (!this.isAdmin) return;
    if (!this.searchUserTestId) {
      alert('Введите userTestId');
      return;
    }

    this.userTestsService.getByIdFull(this.searchUserTestId).subscribe({
      next: (res) => {
        this.allUserTests = [res];
        this.totalPages = 1;
        this.totalItems = 1;
        this.expanded = {};
        this.expanded[res.userTestId] = false;
      },
      error: (err) => {
        console.error('Error searching by Id', err);
        alert('UserTest not found');
        this.allUserTests = [];
        this.totalPages = 1;
        this.totalItems = 0;
      }
    });
  }

  onSearchByEmail(): void {
    if (!this.isAdmin) return;
    if (!this.searchEmail.trim()) {
      alert('Введите email');
      return;
    }
    this.currentPage = 1;
    this.loadDataByEmail(this.searchEmail.trim());
  }

  loadDataByEmail(email: string) {
    this.userTestsService.getByUserEmail(email, this.currentPage, this.pageSize)
      .subscribe({
        next: (res) => {
          const itemsAny = (res as any).items || [];
          this.allUserTests = itemsAny;
          this.totalPages = (res as any).totalPages;
          this.totalItems = (res as any).totalItems;

          this.allUserTests.forEach(ut => {
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

  resetSearch(): void {
    this.searchUserTestId = null;
    this.searchEmail = '';
    this.currentPage = 1;
    this.loadData();
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

  getAnswerClass(ans: { isCorrect: boolean; isChosen: boolean }): string {
    if (!ans.isChosen) return '';
    return ans.isCorrect ? 'selected-correct' : 'selected-wrong';
  }
}
