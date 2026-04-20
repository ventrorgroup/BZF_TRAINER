import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BzfService, Question } from '../../services/bzf.service';
import { QuestionCardComponent } from '../question-card/question-card';

@Component({
  selector: 'app-unsure-questions',
  standalone: true,
  imports: [CommonModule, QuestionCardComponent],
  templateUrl: './unsure-questions.html',
  styleUrl: './unsure-questions.css'
})
export class UnsureQuestionsComponent implements OnInit {
  questions: Question[] = [];
  currentIndex: number = 0;
  showFeedback: boolean = false;
  loading: boolean = true;

  constructor(private bzfService: BzfService) {}

  ngOnInit() {
    this.loadQuestions();
  }

  loadQuestions() {
    this.loading = true;
    this.bzfService.getUnsureQuestions().subscribe(data => {
      this.questions = data;
      this.currentIndex = 0;
      this.showFeedback = false;
      this.loading = false;
    });
  }

  onAnswered(isCorrect: boolean) {
    this.showFeedback = true;
    this.bzfService.submitAnswer(this.questions[this.currentIndex].id, isCorrect).subscribe();
  }

  next() {
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
      this.showFeedback = false;
    } else {
      this.loadQuestions(); // Refetch
    }
  }
}
