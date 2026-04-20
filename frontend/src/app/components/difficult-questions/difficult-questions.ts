import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BzfService, Question } from '../../services/bzf.service';
import { QuestionCardComponent } from '../question-card/question-card';

@Component({
  selector: 'app-difficult-questions',
  standalone: true,
  imports: [CommonModule, QuestionCardComponent],
  template: `
<div class="learning-container">
  <div class="header">
    <h1 class="gradient-text">Gemerkte Fragen</h1>
    <p>Hier findst du alle Fragen, die du als "Schwer" markiert hast.</p>
  </div>

  <div *ngIf="questions.length > 0; else emptyState">
    <div class="question-list">
      <div *ngFor="let q of questions; let i = index" class="q-wrapper">
        <app-question-card 
          [question]="q" 
          [showFeedback]="true">
        </app-question-card>
      </div>
    </div>
  </div>

  <ng-template #emptyState>
    <div class="glass-card empty-state">
      <div class="empty-icon">⭐</div>
      <h3>Noch keine Fragen gemerkt</h3>
      <p>Markiere schwierige Fragen im Lern-Modus mit dem "Merken" Button.</p>
    </div>
  </ng-template>
</div>
  `,
  styles: [`
    .learning-container { max-width: 800px; margin: 0 auto; padding: 2rem; }
    .header { margin-bottom: 2rem; text-align: center; }
    .question-list { display: flex; flex-direction: column; gap: 2rem; }
    .empty-state { text-align: center; padding: 4rem; }
    .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
  `]
})
export class DifficultQuestionsComponent implements OnInit {
  questions: Question[] = [];

  constructor(private bzfService: BzfService) {}

  ngOnInit() {
    this.bzfService.getDifficultQuestions().subscribe(data => {
      this.questions = data;
    });
  }
}
