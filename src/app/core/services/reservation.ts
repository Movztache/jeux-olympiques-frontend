// src/app/reservations/services/reservations.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reservation, CreateReservationDto, UpdateReservationDto } from '../models/reservation';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReservationsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/reservations`;

  // Récupérer toutes les réservations
  getReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(this.apiUrl);
  }

  // Récupérer les réservations d'un utilisateur
  getUserReservations(userId: number): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/user/${userId}`);
  }

  // Récupérer une réservation par ID
  getReservationById(id: number): Observable<Reservation> {
    return this.http.get<Reservation>(`${this.apiUrl}/${id}`);
  }

  // Créer une nouvelle réservation
  createReservation(reservation: CreateReservationDto): Observable<Reservation> {
    return this.http.post<Reservation>(this.apiUrl, reservation);
  }

  // Mettre à jour une réservation
  updateReservation(id: number, reservation: UpdateReservationDto): Observable<Reservation> {
    return this.http.patch<Reservation>(`${this.apiUrl}/${id}`, reservation);
  }

  // Utiliser une réservation (marquer comme utilisée)
  useReservation(id: number): Observable<Reservation> {
    return this.http.patch<Reservation>(`${this.apiUrl}/${id}/use`, {
      isUsed: true,
      usageDate: new Date()
    });
  }

  // Vérifier un QR code de réservation
  verifyQrCode(qrCode: string): Observable<Reservation> {
    return this.http.post<Reservation>(`${this.apiUrl}/verify`, { qrCode });
  }

  // Supprimer une réservation
  deleteReservation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
