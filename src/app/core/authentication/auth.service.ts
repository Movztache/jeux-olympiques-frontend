// src/app/core/authentication/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '../models/user.model';
import { environment } from '../../../environments/environment';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  // URL de l'API depuis l'environnement
  private apiUrl = environment.apiUrl;

  // Clé utilisée pour stocker le token dans le localStorage
  private tokenKey = 'auth_token';

  constructor(private http: HttpClient) {
    // Récupération des informations utilisateur au démarrage
    const userInfo = this.getUserInfo();

    // Initialisation du BehaviorSubject
    this.currentUserSubject = new BehaviorSubject<User | null>(userInfo);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(loginRequest: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, loginRequest)
      .pipe(
        tap(response => {
          if (response && response.accessToken) {
            this.storeToken(response.accessToken);

            if (response.user) {
              this.storeUserInfo(response.user);
              this.currentUserSubject.next(response.user);
            }
          }
        }),
        catchError(this.handleError)
      );
  }

  register(registerRequest: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, registerRequest)
      .pipe(
        tap(response => {
          if (response && response.accessToken) {
            this.storeToken(response.accessToken);

            if (response.user) {
              this.storeUserInfo(response.user);
              this.currentUserSubject.next(response.user);
            }
          }
        }),
        catchError(this.handleError)
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('user_info');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  isTokenExpired(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token);
      return decoded.exp < Date.now() / 1000;
    } catch (err) {
      return true;
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private storeToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private storeUserInfo(userInfo: User): void {
    localStorage.setItem('user_info', JSON.stringify(userInfo));
  }

  getUserInfo(): User | null {
    const userInfo = localStorage.getItem('user_info');
    return userInfo ? JSON.parse(userInfo) : null;
  }

  refreshUserInfo(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/auth/me`)
      .pipe(
        tap(user => {
          this.storeUserInfo(user);
          this.currentUserSubject.next(user);
          return user;
        }),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      errorMessage = error.error?.message ||
        `Code: ${error.status}, ` +
        `Message: ${error.message}`;
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
