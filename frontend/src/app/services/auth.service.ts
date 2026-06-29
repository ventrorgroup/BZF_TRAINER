import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly storageKey = 'bzf_app_password';
  private readonly adminStorageKey = 'bzf_admin_password';
  
  // Signal to hold the current logged in state
  isLoggedIn = signal<boolean>(this.hasToken());
  isAdminLoggedIn = signal<boolean>(this.hasAdminToken());
  
  // Signal to hold the current active account
  currentAccount = signal<{ guid: string, name: string } | null>(null);

  get apiUrl(): string {
    const port = window.location.port;
    const hostname = window.location.hostname;

    if (port === '4200') {
      return `http://${hostname}:3000/api`;
    }
    if ((hostname === 'localhost' || hostname === '127.0.0.1') && port !== '5123' && port !== '') {
      return 'http://localhost:3000/api';
    }
    return '/api';
  }

  constructor(private http: HttpClient) {
    this.initializeAccountFromUrl();
    this.loadCurrentAccount();
  }

  private hasToken(): boolean {
    if (typeof window !== 'undefined' && window.localStorage) {
      return !!localStorage.getItem(this.storageKey);
    }
    return false;
  }

  private hasAdminToken(): boolean {
    if (typeof window !== 'undefined' && window.localStorage) {
      return !!localStorage.getItem(this.adminStorageKey);
    }
    return false;
  }

  getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(this.storageKey);
    }
    return null;
  }

  getAdminToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(this.adminStorageKey);
    }
    return null;
  }

  private initializeAccountFromUrl(): void {
    if (typeof window !== 'undefined' && window.location) {
      const params = new URLSearchParams(window.location.search);
      const urlAccount = params.get('account');
      if (urlAccount) {
        localStorage.setItem('bzf_account_guid', urlAccount);
        // Clean URL to remove search params
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }
  }

  loadCurrentAccount(): void {
    if (this.isLoggedIn()) {
      this.http.get(`${this.apiUrl}/auth/current-account`).subscribe({
        next: (account: any) => {
          this.currentAccount.set(account);
        },
        error: () => {
          // If query fails, default to Standard-Account representation
          this.currentAccount.set({ guid: 'default-account-guid', name: 'Standard-Account' });
        }
      });
    } else {
      this.currentAccount.set(null);
    }
  }

  switchAccount(guid: string | null): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (guid) {
        localStorage.setItem('bzf_account_guid', guid);
      } else {
        localStorage.removeItem('bzf_account_guid');
      }
      this.loadCurrentAccount();
      // Reload is required to wipe any active memory stats and update components
      window.location.reload();
    }
  }

  login(password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { password }).pipe(
      tap((res: any) => {
        if (res && res.success && res.token) {
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem(this.storageKey, res.token);
          }
          this.isLoggedIn.set(true);
          this.loadCurrentAccount();
        }
      })
    );
  }

  logout(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem('bzf_account_guid');
    }
    this.isLoggedIn.set(false);
    this.currentAccount.set(null);
  }

  // Admin auth methods
  loginAdmin(password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/auth`, { password }).pipe(
      tap((res: any) => {
        if (res && res.success && res.token) {
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem(this.adminStorageKey, res.token);
          }
          this.isAdminLoggedIn.set(true);
        }
      })
    );
  }

  setupDatabase(): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/db-setup`, {});
  }

  logoutAdmin(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.adminStorageKey);
    }
    this.isAdminLoggedIn.set(false);
  }
}
