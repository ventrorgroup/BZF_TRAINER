import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BzfService } from '../../services/bzf.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-english-training',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './english-training.html',
  styleUrl: './english-training.css',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class EnglishTrainingComponent implements OnInit {
  currentText: any = null;
  showTranslation: boolean = false;
  loading: boolean = true;
  error: boolean = false;
  isSaved: boolean = false;
  currentNumber: string = "1";

  constructor(private bzfService: BzfService) {}

  ngOnInit() {
    this.loadText("1");
  }

  loadText(num: string) {
    this.loading = true;
    this.showTranslation = false;
    this.error = false;
    this.currentNumber = num;
    
    this.bzfService.getTextByNumber(num).subscribe(text => {
      if (!text) {
        this.error = true;
        this.loading = false;
        return;
      }
      this.currentText = text;
      this.isSaved = text?.stats?.isFavorite || false;
      this.loading = false;
    });
  }

  loadRandom() {
    this.loading = true;
    this.showTranslation = false;
    this.error = false;
    this.bzfService.getRandomText().subscribe(text => {
      if (!text) {
        this.error = true;
        this.loading = false;
        return;
      }
      this.currentText = text;
      this.currentNumber = text.number;
      this.isSaved = text?.stats?.isFavorite || false;
      this.loading = false;
    });
  }

  next() {
    const nextNum = parseInt(this.currentNumber) + 1;
    if (nextNum <= 70) this.loadText(nextNum.toString());
  }

  prev() {
    const prevNum = parseInt(this.currentNumber) - 1;
    if (prevNum >= 1) this.loadText(prevNum.toString());
  }

  toggleTranslation() {
    this.showTranslation = !this.showTranslation;
  }

  rate(difficulty: string) {
    if (!this.currentText) return;
    this.bzfService.rateText(this.currentText.id, difficulty).subscribe(() => {
      this.next();
    });
  }

  toggleSave() {
    if (!this.currentText) return;
    this.isSaved = !this.isSaved;
    this.bzfService.rateText(this.currentText.id, this.currentText.stats?.difficulty || 'unknown', this.isSaved).subscribe();
  }

  formatText(text: string) {
    if (!text) return [];
    return text.split('\n').map(line => {
      const trimmed = line.trim();
      // Match starts with "-", "•" or "a.", "b.", "1.", etc.
      const bulletMatch = trimmed.match(/^([-•]|[a-zA-Z0-9]\.)\s+(.*)/);
      
      if (bulletMatch) {
        return {
          content: bulletMatch[2],
          marker: bulletMatch[1],
          isBullet: true
        };
      }
      return {
        content: line,
        marker: '',
        isBullet: false
      };
    });
  }
}
