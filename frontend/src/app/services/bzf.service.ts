import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Answer {
  id: number;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: number;
  qNumber: string;
  text: string;
  answers: Answer[];
  stats?: {
    correct: number;
    incorrect: number;
  };
}

export interface DashboardStats {
  totalQuestions: number;
  answeredQuestions: number;
  difficultCount: number;
  totalCorrect: number;
  totalIncorrect: number;
  recentExams: any[];
}

export interface Exam {
  id: number;
  name: string;
  _count?: {
    results: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class BzfService {
  private get apiUrl(): string {
    const port = window.location.port;
    const hostname = window.location.hostname;
    if (port === '5123') {
      return '/api';
    }
    return `http://${hostname}:3000/api`;
  }


  constructor(private http: HttpClient) {}

  getRandomQuestion(): Observable<Question> {
    return this.http.get<Question>(`${this.apiUrl}/questions/random`);
  }

  getUnsureQuestions(): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.apiUrl}/questions/unsure`);
  }

  getDifficultQuestions(): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.apiUrl}/questions/difficult`);
  }

  getQuestionByNumber(num: string): Observable<Question> {
    return this.http.get<Question>(`${this.apiUrl}/questions/by-number/${num}`);
  }

  toggleFlag(questionId: number, isDifficult: boolean): Observable<any> {
    return this.http.post(`${this.apiUrl}/questions/${questionId}/toggle-flag`, { isDifficult });
  }

  submitAnswer(questionId: number, isCorrect: boolean): Observable<any> {
    return this.http.post(`${this.apiUrl}/answers`, { questionId, isCorrect });
  }

  getExams(): Observable<Exam[]> {
    return this.http.get<Exam[]>(`${this.apiUrl}/exams`);
  }

  getExam(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/exams/${id}`);
  }

  submitExamResult(examId: number, score: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/exams/${examId}/result`, { score });
  }

  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats/dashboard`);
  }

  resetStats(): Observable<any> {
    return this.http.post(`${this.apiUrl}/stats/reset`, {});
  }

  // BZF English Texts
  getRandomText(): Observable<any> {
    return this.http.get(`${this.apiUrl}/texts/random`);
  }

  getTextByNumber(num: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/texts/by-number/${num}`);
  }

  getTextsByDifficulty(diff: string): Observable<any[]> {

    return this.http.get<any[]>(`${this.apiUrl}/texts/by-difficulty/${diff}`);
  }

  rateText(textId: number, difficulty: string, isFavorite?: boolean): Observable<any> {
    return this.http.post(`${this.apiUrl}/texts/${textId}/rate`, { difficulty, isFavorite });
  }
}

