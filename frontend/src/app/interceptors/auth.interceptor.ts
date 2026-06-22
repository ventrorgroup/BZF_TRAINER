import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  // Safe localStorage access
  const isBrowser = typeof window !== 'undefined' && !!window.localStorage;
  const accountGuid = isBrowser ? localStorage.getItem('bzf_account_guid') : null;
  const adminPassword = isBrowser ? localStorage.getItem('bzf_admin_password') : null;

  let headers = req.headers;
  
  if (token) {
    headers = headers.set('x-bzf-password', token);
  }
  
  if (accountGuid) {
    headers = headers.set('x-account-guid', accountGuid);
  }
  
  if (adminPassword && req.url.includes('/api/admin')) {
    headers = headers.set('x-admin-password', adminPassword);
  }

  const authReq = req.clone({ headers });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // If unauthorized (401), automatically log out (except for login endpoints)
      if (error.status === 401 && !req.url.includes('/api/auth/login') && !req.url.includes('/api/admin/auth')) {
        if (req.url.includes('/api/admin')) {
          if (isBrowser) {
            localStorage.removeItem('bzf_admin_password');
          }
        } else {
          authService.logout();
        }
      }
      return throwError(() => error);
    })
  );
};
