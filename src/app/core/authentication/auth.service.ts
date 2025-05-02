// src/app/core/authentication/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
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
    return this.http.post<any>(`${this.apiUrl}/auth/login`, loginRequest)
      .pipe(
        map((response: any) => {
          // Transformer la réponse API en structure AuthResponse attendue
          const authResponse: AuthResponse = {
            accessToken: response.token, // Utiliser le token reçu comme accessToken
            user: {
              // Propriétés obligatoires selon l'interface User
              email: response.email,
              lastName: response.lastName || '', // Valeur par défaut si absente dans la réponse
              firstName: response.firstName || '', // Valeur par défaut si absente dans la réponse
              roles: [response.role], // Conversion du rôle en tableau pour correspondre à l'interface
              // Autres propriétés optionnelles disponibles dans la réponse
              userId: response.id
            }
          };
          return authResponse;
        }),
        tap((authResponse: AuthResponse) => {
          this.storeToken(authResponse.accessToken);
          this.storeUserInfo(authResponse.user);
          this.currentUserSubject.next(authResponse.user);
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

  private getUserInfo(): User | null {
    const userJson = localStorage.getItem('user_info');
    return userJson ? JSON.parse(userJson) : null;
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

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur inconnue est survenue';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = `Code d'erreur: ${error.status}, Message: ${error.message}`;
    }

    // Vous pouvez ajouter ici de la journalisation ou d'autres traitements
    console.error(errorMessage);

    // Retourner un observable avec un message d'erreur
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

  hasRole(roles: string | string[]): boolean {
    const currentUser = this.currentUserValue;
    if (!currentUser || !currentUser.roles) {
      return false;
    }

    if (Array.isArray(roles)) {
      // Vérifier si l'utilisateur possède au moins un des rôles fournis
      return roles.some(role => currentUser.roles.includes(role));
    } else {
      // Vérifier un seul rôle
      return currentUser.roles.includes(roles);
    }
  }


// Méthode helper pour obtenir l'utilisateur actuel
  private getCurrentUser() {
    // Récupérer l'utilisateur depuis le localStorage ou autre source
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
  }


}
