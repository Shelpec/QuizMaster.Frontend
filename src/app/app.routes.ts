// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { QuestionsListComponent } from './questions-list/questions-list.component';
import { QuestionDetailsComponent } from './question-details/question-details.component';
import { LoginComponent } from './auth/login.component';
import { RegisterComponent } from './auth/register.component';

export const routes: Routes = [
  { path: '', redirectTo: 'questions', pathMatch: 'full' },
  { path: 'questions', component: QuestionsListComponent },
  { path: 'questions/:id', component: QuestionDetailsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '**', redirectTo: 'questions' }
];
