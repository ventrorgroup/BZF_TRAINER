import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BzfService } from '../../services/bzf.service';
import { QuestionCardComponent } from '../question-card/question-card';

@Component({
  selector: 'app-learning-mode',
  standalone: true,
  imports: [CommonModule, QuestionCardComponent],
  templateUrl: './learning-mode.html',
  styleUrl: './learning-mode.css'
})
export class LearningModeComponent implements OnInit {
  @ViewChild(QuestionCardComponent) qCard!: QuestionCardComponent;
  
  currentQuestion: any = null;
  showFeedback: boolean = false;
  loading: boolean = true;

  constructor(private bzfService: BzfService) {}

  ngOnInit() {
    this.nextQuestion();
  }

  nextQuestion() {
    this.loading = true;
    this.showFeedback = false;
    this.bzfService.getRandomQuestion().subscribe(q => {
      this.currentQuestion = q;
      this.loading = false;
    });
  }

  onAnswered(isCorrect: boolean) {
    this.showFeedback = true;
    this.bzfService.submitAnswer(this.currentQuestion.id, isCorrect).subscribe();
  }
}
