import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BzfService } from '../../services/bzf.service';

@Component({
  selector: 'app-question-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './question-card.html',
  styleUrl: './question-card.css'
})
export class QuestionCardComponent implements OnInit {
  @Input() question: any;
  @Input() showFeedback: boolean = false;
  @Output() answered = new EventEmitter<boolean>();

  shuffledAnswers: any[] = [];
  selectedAnswer: any = null;
  isDifficult: boolean = false;

  constructor(private bzfService: BzfService) {}

  ngOnInit() {
    this.shuffle();
    if (this.question && this.question.stats) {
      this.isDifficult = this.question.stats.isDifficult;
    }
  }

  toggleDifficult(event: MouseEvent) {
    event.stopPropagation();
    this.isDifficult = !this.isDifficult;
    this.bzfService.toggleFlag(this.question.id, this.isDifficult).subscribe();
  }

  shuffle() {
    if (this.question && this.question.answers) {
      this.shuffledAnswers = [...this.question.answers].sort(() => Math.random() - 0.5);
    }
  }

  select(answer: any) {
    if (this.showFeedback) return;
    this.selectedAnswer = answer;
    this.answered.emit(answer.isCorrect);
  }

  getOptionClass(answer: any) {
    if (!this.showFeedback) {
      return this.selectedAnswer === answer ? 'selected' : '';
    }
    if (answer.isCorrect) return 'correct';
    if (this.selectedAnswer === answer && !answer.isCorrect) return 'incorrect';
    return '';
  }
}
