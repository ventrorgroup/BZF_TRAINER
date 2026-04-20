import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
<div class="app-container">
  <nav class="glass-nav">
    <div class="logo">
      <span class="gradient-text">BZF Trainer Pro</span>
    </div>
    <div class="nav-links">
      <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">Dashboard</a>
      <a routerLink="/learn" routerLinkActive="active" class="nav-item">Lern-Modus</a>
      <a routerLink="/exams" routerLinkActive="active" class="nav-item">Prüfungen</a>
      <a routerLink="/unsure" routerLinkActive="active" class="nav-item">Unsicher</a>
      <a routerLink="/difficult" routerLinkActive="active" class="nav-item">Schwer</a>
    </div>
  </nav>

  <main class="content-area">
    <router-outlet></router-outlet>
  </main>
</div>
  `,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'BZF Trainer';
}
