import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BzfService } from '../../services/bzf.service';
import { animate, style, transition, trigger } from '@angular/animations';

interface Step {
  id: number;
  type: 'message' | 'instruction';
  role?: 'pilot' | 'tower';
  promptDe?: string;
  promptEn?: string;
  textDe?: string;
  textEn?: string;
}

interface Simulation {
  id: string;
  title: string;
  steps: Step[];
}

@Component({
  selector: 'app-sprechfunk-simulation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sprechfunk-simulation.html',
  styleUrl: './sprechfunk-simulation.css',
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(15px)' }),
        animate('250ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class SprechfunkSimulationComponent implements OnInit {
  @ViewChild('historyContainer') private historyContainer!: ElementRef;

  simulations: Simulation[] = [];
  selectedSimulation: Simulation | null = null;
  currentStepIndex: number = 0;
  revealedSteps: Step[] = [];
  isCurrentStepRevealed: boolean = false;
  language: 'de' | 'en' = 'de';
  loading: boolean = true;
  error: boolean = false;

  constructor(private bzfService: BzfService) {}

  ngOnInit() {
    this.loadSimulations();
  }

  loadSimulations() {
    this.loading = true;
    this.error = false;
    this.bzfService.getSprechfunkSimulations().subscribe({
      next: (data) => {
        this.simulations = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading simulations', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  selectSimulation(sim: Simulation) {
    this.selectedSimulation = sim;
    this.resetSimulation();
  }

  resetSimulation() {
    this.currentStepIndex = 0;
    this.revealedSteps = [];
    this.isCurrentStepRevealed = false;
    this.advanceAutoSteps();
    this.scrollToBottom();
  }

  get currentStep(): Step | null {
    if (!this.selectedSimulation) return null;
    if (this.currentStepIndex >= this.selectedSimulation.steps.length) return null;
    return this.selectedSimulation.steps[this.currentStepIndex];
  }

  get isFinished(): boolean {
    if (!this.selectedSimulation) return false;
    return this.currentStepIndex >= this.selectedSimulation.steps.length;
  }

  get progressPercentage(): number {
    if (!this.selectedSimulation) return 0;
    return Math.round((this.currentStepIndex / this.selectedSimulation.steps.length) * 100);
  }

  revealPilotSolution() {
    this.isCurrentStepRevealed = true;
    this.scrollToBottom();
  }

  nextStep() {
    const step = this.currentStep;
    if (!step) return;

    if (step.type === 'message' && step.role === 'pilot') {
      // Add the revealed pilot step to history
      this.revealedSteps.push(step);
      this.currentStepIndex++;
      this.isCurrentStepRevealed = false;
      
      // Auto advance any following tower steps
      this.advanceAutoSteps();
    } else if (step.type === 'instruction') {
      // Instructions are manually advanced
      this.revealedSteps.push(step);
      this.currentStepIndex++;
      
      this.advanceAutoSteps();
    }
    this.scrollToBottom();
  }

  // Automatically plays and moves Tower messages into history
  advanceAutoSteps() {
    if (!this.selectedSimulation) return;
    
    while (this.currentStepIndex < this.selectedSimulation.steps.length) {
      const next = this.selectedSimulation.steps[this.currentStepIndex];
      if (next.type === 'message' && next.role === 'tower') {
        this.revealedSteps.push(next);
        this.currentStepIndex++;
      } else {
        // Stop if it's a pilot step or an instruction
        break;
      }
    }
    this.scrollToBottom();
  }

  toggleLanguage() {
    this.language = this.language === 'de' ? 'en' : 'de';
  }

  exitSimulation() {
    this.selectedSimulation = null;
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      try {
        if (this.historyContainer) {
          const el = this.historyContainer.nativeElement;
          el.scrollTop = el.scrollHeight;
        }
      } catch (err) {
        // Silent ignore
      }
    }, 100);
  }
}
