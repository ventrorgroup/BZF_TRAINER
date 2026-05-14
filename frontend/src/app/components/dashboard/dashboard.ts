import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BzfService } from '../../services/bzf.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  stats: any = null;

  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: { 
          color: '#f8fafc',
          padding: 20,
          font: { size: 14 }
        }
      },
    }
  };

  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: ['Richtig', 'Falsch'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['#22c55e', '#ef4444'],
      hoverBackgroundColor: ['#4ade80', '#f87171'],
      borderWidth: 0
    }]
  };

  public pieChartType: ChartType = 'pie';

  constructor(private bzfService: BzfService) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.bzfService.getDashboardStats().subscribe(data => {
      this.stats = data;
      
      // Update chart data by creating a new object reference to trigger change detection
      this.pieChartData = {
        ...this.pieChartData,
        datasets: [{
          ...this.pieChartData.datasets[0],
          data: [data.totalCorrect, data.totalIncorrect]
        }]
      };

      // Force chart update after a small tick
      setTimeout(() => {
        this.chart?.update();
      }, 100);
    });
  }

  getSuccessRate() {
    if (!this.stats || (this.stats.totalCorrect + this.stats.totalIncorrect) === 0) return 0;
    return Math.round((this.stats.totalCorrect / (this.stats.totalCorrect + this.stats.totalIncorrect)) * 100);
  }

  resetProgress() {
    if (confirm('Bist du sicher, dass du deinen kompletten Lernfortschritt (Fragen und Texte) löschen möchtest? Dies kann nicht rückgängig gemacht werden.')) {
      this.bzfService.resetStats().subscribe(() => {
        this.loadStats();
        alert('Fortschritt wurde zurückgesetzt.');
      });
    }
  }
}
