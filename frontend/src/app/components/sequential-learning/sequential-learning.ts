import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BzfService, Question } from '../../services/bzf.service';
import { QuestionCardComponent } from '../question-card/question-card';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-sequential-learning',
  standalone: true,
  imports: [CommonModule, QuestionCardComponent, RouterLink, MatProgressBarModule],
  template: `
<div class="sequential-container">
  <div class="header-actions">
    <button class="btn-secondary" routerLink="/dashboard">Zurück zum Dashboard</button>
    <div class="progress-info">
      <span>Frage {{currentNum}} von 261</span>
      <mat-progress-bar mode="determinate" [value]="(currentNum / 261) * 100"></mat-progress-bar>
    </div>
  </div>

  <div class="content-wrapper" *ngIf="question">
    <app-question-card 
      [question]="question" 
      (answered)="onAnswered($event)">
    </app-question-card>

    <div class="nav-controls">
      <button 
        class="btn-secondary" 
        [disabled]="currentNum <= 1" 
        (click)="navigate(-1)">
        Vorherige
      </button>
      <button 
        class="btn-primary" 
        [disabled]="currentNum >= 261" 
        (click)="navigate(1)">
        Nächste
      </button>
    </div>
  </div>

  <div class="loading-state" *ngIf="!question">
    <div class="spinner"></div>
    <p>Lade Frage {{currentNum}}...</p>
  </div>
</div>
  `,
  styles: [`
    .sequential-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      gap: 2rem;
    }
    .progress-info {
      flex: 1;
      text-align: right;
    }
    .progress-info span {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
      color: var(--text-muted);
    }
    .nav-controls {
      display: flex;
      justify-content: space-between;
      margin-top: 2rem;
    }
    .loading-state {
      text-align: center;
      padding: 4rem;
    }
  `]
})
export class SequentialLearningComponent implements OnInit {
  currentNum: number = 1;
  question: Question | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bzfService: BzfService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.currentNum = parseInt(params['num']) || 1;
      this.loadQuestion();
    });
  }

  loadQuestion() {
    this.question = null;
    this.bzfService.getQuestionByNumber(this.currentNum.toString()).subscribe(q => {
      this.question = q;
    });
  }

  navigate(delta: number) {
    const nextNum = this.currentNum + delta;
    if (nextNum >= 1 && nextNum <= 261) {
      this.router.navigate(['/learn/sequential', nextNum]);
    }
  }

  onAnswered(result: any) {
    // Optionally auto-navigate after a delay or just let the user click "Next"
    this.bzfService.submitAnswer(this.question!.id, result.correct).subscribe();
  }
}
