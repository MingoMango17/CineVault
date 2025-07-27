import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  UserFetchResponse,
  UserLogin,
  UserModel,
  UserRegister,
} from '../model/user.model';
import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  throwError,
  tap,
} from 'rxjs';
import { Router } from '@angular/router';

class TokenClass {
  access: string;
  refresh: string;

  constructor() {
    this.access = '';
    this.refresh = '';
  }
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = 'http://127.0.0.1:8000/auth';
  private currentUserSubject = new BehaviorSubject<UserModel | null>(null);
  private accessToken = 'access_token';
  private refreshToken = 'refresh_token';
  private userKey = 'current_user';

  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.initializeUser();
  }

  private initializeUser(): void {
    try {
      const token = this.getStoredToken();
      const user = this.getStoredUser();

      if (token && user) {
        // Verify token is not expired before setting user
        if (!this.isTokenExpired(token)) {
          this.currentUserSubject.next(user);
        } else {
          // Token expired, clear auth data
          this.clearAuthData();
        }
      }
    } catch (error) {
      console.error('Error initializing user:', error);
      this.clearAuthData();
    }
  }

  // Sign Up
  signUp(request: UserRegister): Observable<UserFetchResponse> {
    return this.http
      .post<UserFetchResponse>(`${this.apiUrl}/signup`, request)
      .pipe(
        map((response) => {
          // Handle different response structures
          if (response.tokens && response.user) {
            this.setAuthData(response.user, response.tokens);
          } else if (response.user) {
            // Some APIs might not return token on signup
            console.warn(
              'No token in signup response, user might need to sign in'
            );
          }
          return response;
        }),
        catchError(this.handleError)
      );
  }

  // Sign In
  signIn(request: UserLogin): Observable<UserFetchResponse> {
    return this.http
      .post<UserFetchResponse>(`${this.apiUrl}/signin`, request)
      .pipe(
        map((response) => {
          if (response.tokens && response.user) {
            this.setAuthData(response.user, response.tokens);
          } else {
            console.error('Invalid response structure:', response);
            throw new Error('Invalid authentication response');
          }
          return response;
        }),
        catchError(this.handleError)
      );
  }

  // Sign Out
  signOut(): void {
    this.http
      .post(`${this.apiUrl}/signout`, {})
      .pipe(
        catchError((error) => {
          console.error('Sign out error:', error);
          return throwError(() => error);
        })
      )
      .subscribe({
        complete: () => {
          this.clearAuthData();
          this.currentUserSubject.next(null);
          this.router.navigate(['/login']);
        },
      });
  }

  // Get current user
  getCurrentUser(): UserModel | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    const user = this.getCurrentUser();
    const isAuth = !!(token && user && !this.isTokenExpired(token));
    return isAuth;
  }

  // Get auth token
  getToken(): string | null {
    return this.getStoredToken();
  }

  // Get auth headers for HTTP requests
  getAuthHeaders(): HttpHeaders {
    const token = this.getStoredToken();
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    });
  }

  // Refresh token (if your API supports it)
  refreshAcessToken(): Observable<UserFetchResponse> {
    return this.http.post<UserFetchResponse>(`${this.apiUrl}/refresh`, {}).pipe(
      map((response) => {
        if (response.tokens && response.user) {
          this.setAuthData(response.user, response.tokens);
        }
        return response;
      }),
      catchError((error) => {
        this.signOut();
        return throwError(() => error);
      })
    );
  }

  // Forgot password
  forgotPassword(email: string): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/forgot-password`, { email })
      .pipe(catchError(this.handleError));
  }

  // Reset password
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/reset-password`, {
        token,
        password: newPassword,
      })
      .pipe(catchError(this.handleError));
  }

  // Force refresh current user from storage
  refreshCurrentUser(): void {
    const user = this.getStoredUser();
    if (user) {
      this.currentUserSubject.next(user);
    }
  }

  // Private helper methods
  private setAuthData(user: UserModel, token: TokenClass): void {
    try {
      localStorage.setItem(this.accessToken, token.access);
      localStorage.setItem(this.refreshToken, token.refresh);
      localStorage.setItem(this.userKey, JSON.stringify(user));

      // Emit the new user value
      this.currentUserSubject.next(user);

      // Double-check it was set
      const storedUser = this.getStoredUser();
    } catch (error) {
      console.error('Error setting auth data:', error);
    }
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.accessToken);
    localStorage.removeItem(this.refreshToken);
    localStorage.removeItem(this.userKey);
  }

  private getStoredToken(): string | null {
    try {
      return localStorage.getItem(this.accessToken);
    } catch (error) {
      console.error('Error getting stored token:', error);
      return null;
    }
  }

  private getStoredUser(): UserModel | null {
    try {
      const userStr = localStorage.getItem(this.userKey);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      if (isExpired) {
        console.log('Token is expired');
      }
      return isExpired;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error?.message || `Server error: ${error.status}`;
    }

    console.error('Auth error:', errorMessage, error);
    return throwError(() => ({ message: errorMessage, status: error.status }));
  }
}
