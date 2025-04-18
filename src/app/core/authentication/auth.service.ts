// src/app/core/authentication/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '../models/user.model';
import { environment } from '../../../environments/environment';
import { jwtDecode } from 'jwt-decode';

// Définition de l'interface pour le payload du token JWT
interface TokenPayload {
  sub: string;      // ID utilisateur
  exp?: number;     // Date d'expiration
  roles?: string[]; // Rôles utilisateur
  iat?: number;     // Date d'émission du token
}

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

  // Pour la demande de réinitialisation de mot de passe
  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/forgot-password`, { email })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Pour la réinitialisation de mot de passe
  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/reset-password`, { token, password })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Pour vérifier la validité d'un token de réinitialisation
  verifyResetToken(token: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/auth/verify-reset-token/${token}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Méthode pour vérifier si l'utilisateur est authentifié
  isAuthenticated(): boolean {
    const token = this.getToken();

    if (!token) {
      return false;
    }

    // Vérification de l'expiration du token
    try {
      const decodedToken = jwtDecode<TokenPayload>(token);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp && decodedToken.exp < currentTime) {
        // Token expiré
        this.logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la validation du token:', error);
      return false;
    }
  }

  hasRole(requiredRoles: string[]): boolean {
    const user = this.currentUserValue;

    // Si l'utilisateur n'est pas connecté, retourner false
    if (!user) {
      return false;
    }

    // Vérifier si l'utilisateur a au moins un des rôles requis
    return requiredRoles.some(role => user.roles.includes(role));
  }

}
