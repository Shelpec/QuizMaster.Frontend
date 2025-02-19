// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { QuestionsListComponent } from './questions-list/questions-list.component';
import { TestListComponent } from './test-list/test-list.component';
import { LoginComponent } from './auth/login.component';
import { RegisterComponent } from './auth/register.component';
import { QuestionDetailsComponent } from './question-details/question-details.component';
import { StartTestComponent } from './user-tests/start-test.component';
import { UserTestsHistoryComponent } from './user-tests-history/user-tests-history.component';
import { HomeComponent } from './home/home.component';

// Подключаем наш AuthGuard
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Главная страница
  { path: '', component: HomeComponent },

  // Защищённые маршруты, только для авторизованных:
  { path: 'questions', component: QuestionsListComponent, canActivate: [AuthGuard] },
  { path: 'tests', component: TestListComponent, canActivate: [AuthGuard] },
  { path: 'questions/:id', component: QuestionDetailsComponent, canActivate: [AuthGuard] },
  { path: 'start-test/:testId', component: StartTestComponent, canActivate: [AuthGuard] },
  { path: 'history-user-tests', component: UserTestsHistoryComponent, canActivate: [AuthGuard] },

  // Открытые маршруты:
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Если что-то не найдено — переброс на главную:
  { path: '**', redirectTo: '' }
];
