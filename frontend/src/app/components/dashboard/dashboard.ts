import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BzfService } from '../../services/bzf.service';
import { AuthService } from '../../services/auth.service';
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

  constructor(private bzfService: BzfService, public authService: AuthService) {}

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

  exportProgress() {
    this.bzfService.exportProgress().subscribe({
      next: (data) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const profileName = this.authService.currentAccount()?.name || 'schueler';
        const cleanName = profileName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        a.download = `bzf-fortschritt-${cleanName}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        alert('Fehler beim Exportieren des Fortschritts: ' + (err.error?.error || err.message));
      }
    });
  }

  importProgress(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const progressData = JSON.parse(e.target.result);
        
        // Simple structural check
        if (!progressData.userStats || !progressData.textStats || !progressData.examResults) {
          alert('Die ausgewählte Datei hat kein gültiges Export-Format.');
          return;
        }

        if (confirm('Achtung: Durch das Importieren wird dein aktueller Fortschritt komplett überschrieben! Möchtest du fortfahren?')) {
          this.bzfService.importProgress(progressData).subscribe({
            next: (res) => {
              alert(res.message || 'Fortschritt erfolgreich importiert!');
              this.loadStats();
            },
            error: (err) => {
              alert('Fehler beim Importieren des Fortschritts: ' + (err.error?.error || err.message));
            }
          });
        }
      } catch (err) {
        alert('Ungültige JSON-Datei.');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Clear value
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
