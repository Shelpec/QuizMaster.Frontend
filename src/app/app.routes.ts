import { Routes } from '@angular/router';
import { QuestionDetailsComponent } from './question-details/question-details.component';
import { QuestionsListComponent } from './questions-list/questions-list.component';

export const routes: Routes = [
  // ... другие маршруты
  { path: "", component: QuestionsListComponent},
  { 
      path: 'questions/:id', 
      component: QuestionDetailsComponent
    },
    { path: "**", redirectTo: "/"},
];
