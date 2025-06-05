// src/app/core/services/user.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

interface ApiResponse {
  message?: string;
  error?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/utilisateurs`;

  constructor(private http: HttpClient) { }

  /**
   * Récupère tous les utilisateurs
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(response => {
        // Le backend renvoie une liste de maps, nous devons les convertir en objets User
        return response.map(userMap => this.mapToUser(userMap));
      })
    );
  }

  /**
   * Récupère un utilisateur par son ID
   * @param id ID de l'utilisateur
   */
  getUserById(id: number): Observable<User> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => this.mapToUser(response))
    );
  }

  /**
   * Met à jour le rôle d'un utilisateur
   * @param userId ID de l'utilisateur
   * @param roleId ID du rôle (1 pour ADMIN, 2 pour USER)
   */
  updateUserRole(userId: number, roleId: number): Observable<User> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/${userId}/role/${roleId}`, {}).pipe(
      map(response => this.mapToUser(response))
    );
  }

  /**
   * Supprime un utilisateur
   * @param id ID de l'utilisateur
   */
  deleteUser(id: number): Observable<{ message: string }> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${id}`).pipe(
      map(response => ({ message: response.message || 'Utilisateur supprimé avec succès' }))
    );
  }

  /**
   * Convertit un objet Map du backend en objet User
   * @param userMap Objet Map retourné par le backend
   */
  private mapToUser(userMap: any): User {
    // Vérifier différentes propriétés possibles pour l'ID utilisateur
    const userId = userMap.userId || userMap.id || userMap.user_id || null;

    // Traiter les rôles
    let roles = [];

    // Vérifier si l'utilisateur a un rôle
    if (userMap.roles) {
      roles = userMap.roles;
    } else if (userMap.role) {
      // Si l'utilisateur a un rôle unique
      roles = [userMap.role];
    } else if (userMap.roleName) {
      // Si l'utilisateur a directement une propriété roleName
      roles = [userMap.roleName];
    }

    // Si les rôles ne sont pas un tableau, essayer de les extraire
    if (!Array.isArray(roles) && typeof roles === 'object') {
      roles = [roles];
    }

    console.log('Rôles extraits pour', userMap.email, ':', roles);

    return {
      userId: userId,
      email: userMap.email || '',
      firstName: userMap.firstName || userMap.firstname || '',
      lastName: userMap.lastName || userMap.lastname || '',
      roles: roles,
      roleId: userMap.roleId,
      roleName: userMap.roleName,
      userKey: userMap.userKey || userMap.email || ''
    };
  }
}
