import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

interface AccountCount {
  userStats: number;
  examResults: number;
  textStats: number;
}

interface Account {
  id: number;
  guid: string;
  name: string;
  createdAt: string;
  _count: AccountCount;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  adminPassword = '';
  newAccountName = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  accounts: Account[] = [];

  constructor(
    public authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.isAdminLoggedIn()) {
      this.loadAccounts();
    }
  }

  login(): void {
    if (!this.adminPassword) {
      this.errorMessage = 'Bitte gib das Admin-Passwort ein.';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.loginAdmin(this.adminPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.adminPassword = '';
        this.loadAccounts();
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401) {
          this.errorMessage = 'Ungültiges Admin-Passwort.';
        } else {
          this.errorMessage = 'Fehler beim Verbinden mit dem Server.';
        }
      }
    });
  }

  logout(): void {
    this.authService.logoutAdmin();
    this.accounts = [];
  }

  loadAccounts(): void {
    this.isLoading = true;
    const url = `${this.authService.apiUrl}/admin/accounts`;
    this.http.get<Account[]>(url).subscribe({
      next: (data) => {
        this.accounts = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.details || err.error?.error || 'Konten konnten nicht geladen werden.';
      }
    });
  }

  createAccount(): void {
    if (!this.newAccountName.trim()) {
      this.errorMessage = 'Bitte einen Namen eingeben.';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const url = `${this.authService.apiUrl}/admin/accounts`;
    this.http.post<Account>(url, { name: this.newAccountName }).subscribe({
      next: (newAcc) => {
        this.isLoading = false;
        this.newAccountName = '';
        this.successMessage = `Account für "${newAcc.name}" erfolgreich angelegt!`;
        this.loadAccounts();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.details || err.error?.error || 'Konto konnte nicht erstellt werden.';
      }
    });
  }

  deleteAccount(account: Account): void {
    if (account.guid === 'default-account-guid') {
      alert('Der Standard-Account kann nicht gelöscht werden.');
      return;
    }
    
    if (confirm(`Möchtest du das Konto von "${account.name}" wirklich löschen? Alle Lernfortschritte dieser Person werden unwiderruflich entfernt.`)) {
      this.isLoading = true;
      const url = `${this.authService.apiUrl}/admin/accounts/${account.id}`;
      this.http.delete(url).subscribe({
        next: () => {
          this.successMessage = `Account von "${account.name}" gelöscht.`;
          this.loadAccounts();
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'Konto konnte nicht gelöscht werden.';
        }
      });
    }
  }

  copyShareLink(account: Account): void {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      const origin = window.location.origin;
      const link = `${origin}/?account=${account.guid}`;
      navigator.clipboard.writeText(link).then(() => {
        alert(`Link für ${account.name} kopiert:\n${link}`);
      }).catch(err => {
        console.error('Kopierfehler:', err);
        alert(`Link:\n${link}`);
      });
    }
  }

  switchToAccount(account: Account): void {
    if (account.guid === 'default-account-guid') {
      this.authService.switchAccount(null);
    } else {
      this.authService.switchAccount(account.guid);
    }
    this.router.navigate(['/dashboard']);
  }
}
