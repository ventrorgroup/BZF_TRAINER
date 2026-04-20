import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard';
import { LearningModeComponent } from './components/learning-mode/learning-mode';
import { ExamSimulationComponent } from './components/exam-simulation/exam-simulation';
import { UnsureQuestionsComponent } from './components/unsure-questions/unsure-questions';
import { SequentialLearningComponent } from './components/sequential-learning/sequential-learning';
import { DifficultQuestionsComponent } from './components/difficult-questions/difficult-questions';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'learn', component: LearningModeComponent },
  { path: 'learn/sequential/:num', component: SequentialLearningComponent },
  { path: 'exams', component: ExamSimulationComponent },
  { path: 'unsure', component: UnsureQuestionsComponent },
  { path: 'difficult', component: DifficultQuestionsComponent },
];
