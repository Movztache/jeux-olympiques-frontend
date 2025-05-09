import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Interface pour les données du profil utilisateur
export interface UserProfile {
  firstName?: string;
  lastName?: string;
  email: string;
  id?: number;
  roleId?: number;
  roleName?: string;
  [key: string]: any; // Pour les propriétés supplémentaires
}

@Injectable({
  providedIn: 'root'
})
export class ProfilService {
  private apiUrl = `${environment.apiUrl}/utilisateurs`;

  constructor(private http: HttpClient) { }

  /**
   * Récupère les informations du profil de l'utilisateur connecté
   */
  getUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/me`).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération du profil:', error);
        throw error;
      })
    );
  }

  /**
   * Met à jour les informations du profil de l'utilisateur
   * @param profileData Les nouvelles données du profil
   */
  updateUserProfile(profileData: UserProfile): Observable<UserProfile> {
    return this.http.put<any>(`${this.apiUrl}/profil`, profileData).pipe(
      map(response => {
        // Supprimer le message de la réponse avant de la retourner comme UserProfile
        const { message, ...userProfile } = response;
        return userProfile as UserProfile;
      }),
      catchError(error => {
        console.error('Erreur lors de la mise à jour du profil:', error);
        throw error;
      })
    );
  }

  /**
   * Change le mot de passe de l'utilisateur
   * @param oldPassword Ancien mot de passe
   * @param newPassword Nouveau mot de passe
   */
  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/change-password`, {
      oldPassword,
      newPassword
    }).pipe(
      catchError(error => {
        console.error('Erreur lors du changement de mot de passe:', error);
        throw error;
      })
    );
  }
}
