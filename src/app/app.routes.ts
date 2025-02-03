// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { QuestionsListComponent } from './questions-list/questions-list.component';
import { TestListComponent } from './test-list/test-list.component';
import { LoginComponent } from './auth/login.component';
import { RegisterComponent } from './auth/register.component';
import { QuestionDetailsComponent } from './question-details/question-details.component';
import { StartTestComponent } from './user-tests/start-test.component';

export const routes: Routes = [
  { path: '', redirectTo: 'questions', pathMatch: 'full' },
  { path: 'questions', component: QuestionsListComponent },
  { path: 'tests', component: TestListComponent },   // <-- вот
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'questions/:id', component: QuestionDetailsComponent },
  { path: 'start-test/:testId', component: StartTestComponent },
  { path: '**', redirectTo: 'questions' }
];
