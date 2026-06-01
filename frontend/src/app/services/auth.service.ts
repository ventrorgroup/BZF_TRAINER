import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly storageKey = 'bzf_app_password';
  
  // Signal to hold the current logged in state
  isLoggedIn = signal<boolean>(this.hasToken());

  private get apiUrl(): string {
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

  constructor(private http: HttpClient) {}

  private hasToken(): boolean {
    if (typeof window !== 'undefined' && window.localStorage) {
      return !!localStorage.getItem(this.storageKey);
    }
    return false;
  }

  getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(this.storageKey);
    }
    return null;
  }

  login(password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { password }).pipe(
      tap((res: any) => {
        if (res && res.success && res.token) {
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem(this.storageKey, res.token);
          }
          this.isLoggedIn.set(true);
        }
      })
    );
  }

  logout(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.storageKey);
    }
    this.isLoggedIn.set(false);
  }
}
