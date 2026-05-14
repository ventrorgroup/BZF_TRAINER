import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-text-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './text-card.html',
  styleUrl: './text-card.css'
})
export class TextCardComponent {
  @Input() text: any;
  @Input() showTranslationByDefault: boolean = false;
  
  showTranslation: boolean = false;

  ngOnInit() {
    this.showTranslation = this.showTranslationByDefault;
  }

  toggleTranslation() {
    this.showTranslation = !this.showTranslation;
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
