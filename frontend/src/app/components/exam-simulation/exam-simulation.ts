import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BzfService, Exam } from '../../services/bzf.service';
import { QuestionCardComponent } from '../question-card/question-card';

@Component({
  selector: 'app-exam-simulation',
  standalone: true,
  imports: [CommonModule, QuestionCardComponent],
  templateUrl: './exam-simulation.html',
  styleUrl: './exam-simulation.css'
})
export class ExamSimulationComponent implements OnInit {
  exams: Exam[] = [];
  activeExam: any = null;
  currentQuestionIndex: number = 0;
  answers: boolean[] = [];
  examFinished: boolean = false;
  score: number = 0;
  loading: boolean = false;
  error: string | null = null;

  constructor(private bzfService: BzfService) {}

  ngOnInit() {
    this.loadExams();
  }

  loadExams() {
    this.loading = true;
    this.error = null;
    this.bzfService.getExams().subscribe({
      next: (data) => {
        this.exams = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Fehler beim Laden der Prüfungen: ' + err.message;
        this.loading = false;
      }
    });
  }

  startExam(exam: Exam) {
    this.loading = true;
    this.error = null;
    this.bzfService.getExam(exam.id).subscribe({
      next: (data) => {
        if (!data || !data.examQuestions || data.examQuestions.length === 0) {
          this.error = 'Diese Prüfung enthält keine Fragen.';
          this.loading = false;
          return;
        }
        this.activeExam = data;
        this.currentQuestionIndex = 0;
        this.answers = [];
        this.examFinished = false;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Fehler beim Starten der Prüfung: ' + err.message;
        this.loading = false;
      }
    });
  }

  onAnswered(isCorrect: boolean) {
    if (!this.activeExam) return;
    this.answers[this.currentQuestionIndex] = isCorrect;
    const currentQuestion = this.activeExam.examQuestions[this.currentQuestionIndex].question;
    this.bzfService.submitAnswer(currentQuestion.id, isCorrect).subscribe();
    
    setTimeout(() => {
      if (this.currentQuestionIndex < this.activeExam.examQuestions.length - 1) {
        this.currentQuestionIndex++;
      } else {
        this.finishExam();
      }
    }, 500);
  }

  finishExam() {
    const correctCount = this.answers.filter(a => a).length;
    this.score = Math.round((correctCount / this.activeExam.examQuestions.length) * 100);
    this.examFinished = true;
    this.bzfService.submitExamResult(this.activeExam.id, this.score).subscribe();
  }

  reset() {
    this.activeExam = null;
    this.loadExams();
  }
}
