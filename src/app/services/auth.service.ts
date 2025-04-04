import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root' // Service disponible dans toute l'application
})
export class AuthService {
  // URL de base de votre API Spring Boot
  private apiUrl = 'http://localhost:8080/api';

  // Clé utilisée pour stocker le token dans le localStorage
  private tokenKey = 'auth_token';

  constructor(private http: HttpClient) { }

  /**
   * Envoie une requête de connexion au serveur
   * @param email Email de l'utilisateur
   * @param password Mot de passe de l'utilisateur
   * @returns Observable contenant la réponse du serveur
   */
  login(email: string, password: string): Observable<any> {
    // Construction de l'objet de données pour la requête
    const loginData = { email, password };

    // Envoi de la requête POST à l'endpoint de login
    return this.http.post<any>(`${this.apiUrl}/auth/login`, loginData)
      .pipe(
        // Stockage du token si présent dans la réponse
        tap(response => {
          if (response && response.token) {
            this.storeToken(response.token);

            // Stocker aussi les informations utilisateur si présentes
            if (response.user) {
              this.storeUserInfo(response.user);
            }
          }
        }),
        // Gestion des erreurs
        catchError(this.handleError)
      );
  }

  /**
   * Déconnecte l'utilisateur en supprimant le token et les informations stockées
   */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('user_info');
  }

  /**
   * Vérifie si l'utilisateur est connecté
   * @returns true si l'utilisateur est connecté, false sinon
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /**
   * Récupère le token d'authentification
   * @returns Le token ou null s'il n'existe pas
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Stocke le token d'authentification
   * @param token Le token à stocker
   */
  private storeToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * Stocke les informations utilisateur
   * @param userInfo Informations sur l'utilisateur
   */
  private storeUserInfo(userInfo: any): void {
    localStorage.setItem('user_info', JSON.stringify(userInfo));
  }

  /**
   * Récupère les informations utilisateur
   * @returns Les informations utilisateur ou null
   */
  getUserInfo(): any {
    const userInfo = localStorage.getItem('user_info');
    return userInfo ? JSON.parse(userInfo) : null;
  }

  /**
   * Gestion des erreurs HTTP
   * @param error L'erreur HTTP
   * @returns Un Observable contenant l'erreur
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue';

    // Erreur côté client ou problème de réseau
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur: ${error.error.message}`;
    }
    // Erreur renvoyée par le backend
    else {
      errorMessage = error.error?.message ||
        `Code: ${error.status}, ` +
        `Message: ${error.message}`;
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
