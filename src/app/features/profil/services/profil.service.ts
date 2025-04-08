// src/app/features/profil/services/profil.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfilService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Récupérer les données du profil utilisateur
  getUserProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/utilisateurs/profil`);
  }

  // Mettre à jour les données du profil
  updateUserProfile(profileData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/utilisateurs/profil`, profileData);
  }
}
