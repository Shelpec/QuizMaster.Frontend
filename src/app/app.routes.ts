import { Routes } from '@angular/router';
import { QuestionDetailsComponent } from './question-details/question-details.component';
import { QuestionsListComponent } from './questions-list/questions-list.component';
import { LoginComponent } from './auth/login.component';
import { RegisterComponent } from './auth/register.component';

export const routes: Routes = [
  // ... другие маршруты
  { path: "questions", component: QuestionsListComponent},
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
      path: 'questions/:id', 
      component: QuestionDetailsComponent
    },
    { path: "**", redirectTo: "/"},
];
