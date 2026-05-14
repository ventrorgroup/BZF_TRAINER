import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BzfService, Question } from '../../services/bzf.service';
import { QuestionCardComponent } from '../question-card/question-card';
import { TextCardComponent } from '../text-card/text-card';

@Component({
  selector: 'app-difficult-questions',
  standalone: true,
  imports: [CommonModule, QuestionCardComponent, TextCardComponent],
  template: `
<div class="learning-container">
  <div class="header">
    <h1 class="gradient-text">Schwerpunkte</h1>
    <p>Deine gemerkten Fragen und schwierigen Englisch-Texte.</p>
  </div>

  <div class="tabs">
    <button [class.active]="activeTab === 'questions'" (click)="setTab('questions')">
        Fragen ({{ questions.length }})
    </button>
    <button [class.active]="activeTab === 'texts'" (click)="setTab('texts')">
        Englisch-Texte ({{ texts.length }})
    </button>
  </div>

  <div class="content" *ngIf="activeTab === 'questions'">
    <div *ngIf="questions.length > 0; else emptyQuestions">
      <div class="list">
        <app-question-card *ngFor="let q of questions" [question]="q" [showFeedback]="true"></app-question-card>
      </div>
    </div>
  </div>

  <div class="content" *ngIf="activeTab === 'texts'">
    <div *ngIf="texts.length > 0; else emptyTexts">
      <div class="list">
        <app-text-card *ngFor="let t of texts" [text]="t"></app-text-card>
      </div>
    </div>
  </div>

  <ng-template #emptyQuestions>
    <div class="glass-card empty-state">
      <div class="empty-icon">❓</div>
      <h3>Keine Fragen gemerkt</h3>
      <p>Markiere schwierige Fragen im Lern-Modus.</p>
    </div>
  </ng-template>

  <ng-template #emptyTexts>
    <div class="glass-card empty-state">
      <div class="empty-icon">📝</div>
      <h3>Keine Texte gemerkt</h3>
      <p>Bewerte Texte als "Schwer" oder nutze den Stern zum Merken.</p>
    </div>
  </ng-template>
</div>
  `,
  styles: [`
    .learning-container { max-width: 1000px; margin: 0 auto; padding: 2rem; }
    .header { margin-bottom: 2rem; text-align: center; }
    .tabs { 
        display: flex; 
        gap: 1rem; 
        margin-bottom: 2rem; 
        justify-content: center;
        background: rgba(255, 255, 255, 0.05);
        padding: 0.5rem;
        border-radius: 12px;
    }
    .tabs button {
        background: transparent;
        border: none;
        color: rgba(255, 255, 255, 0.6);
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s;
    }
    .tabs button.active {
        background: #6366f1;
        color: white;
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }
    .list { display: flex; flex-direction: column; gap: 1.5rem; }
    .empty-state { text-align: center; padding: 4rem; }
    .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
  `]
})
export class DifficultQuestionsComponent implements OnInit {
  questions: Question[] = [];
  texts: any[] = [];
  activeTab: 'questions' | 'texts' = 'questions';

  constructor(private bzfService: BzfService) {}

  ngOnInit() {
    this.bzfService.getDifficultQuestions().subscribe(data => this.questions = data);
    this.bzfService.getTextsByDifficulty('hard').subscribe(data => this.texts = data);
  }

  setTab(tab: 'questions' | 'texts') {
    this.activeTab = tab;
  }
}
