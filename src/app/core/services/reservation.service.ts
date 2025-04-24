// src/app/reservations/services/reservations.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ReservationModel, CreateReservationDto, UpdateReservationDto } from '../models/reservation.model';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ReservationsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/reservations`;

  // Récupérer toutes les réservations
  getReservations(): Observable<ReservationModel[]> {
    return this.http.get<ReservationModel[]>(this.apiUrl);
  }

  getUserReservations(): Observable<ReservationModel[]> {
    // Récupère uniquement les réservations de l'utilisateur connecté
    return this.http.get<ReservationModel[]>(`${this.apiUrl}/user/reservations`);
  }


  // Récupérer une réservation par ID
  getReservationById(id: number): Observable<ReservationModel> {
    return this.http.get<ReservationModel>(`${this.apiUrl}/${id}`);
  }

  // Créer une nouvelle réservation
  createReservation(reservation: CreateReservationDto): Observable<ReservationModel> {
    return this.http.post<ReservationModel>(this.apiUrl, reservation);
  }

  // Mettre à jour une réservation
  updateReservation(id: number, reservation: UpdateReservationDto): Observable<ReservationModel> {
    return this.http.patch<ReservationModel>(`${this.apiUrl}/${id}`, reservation);
  }

  // Utiliser une réservation (marquer comme utilisée)
  useReservation(id: number): Observable<ReservationModel> {
    return this.http.patch<ReservationModel>(`${this.apiUrl}/${id}/use`, {
      isUsed: true,
      usageDate: new Date()
    });
  }

  // Vérifier un QR code de réservation
  verifyQrCode(qrCode: string): Observable<ReservationModel> {
    return this.http.post<ReservationModel>(`${this.apiUrl}/verify`, { qrCode });
  }

  // Supprimer une réservation
  deleteReservation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Annule une réservation existante
   * @param reservationId L'identifiant de la réservation à annuler
   * @returns Observable avec le résultat de l'opération
   */
  cancelReservation(reservationId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/reservations/${reservationId}`);
  }

  /**
   * Marque une réservation comme utilisée
   * @param reservationId L'identifiant de la réservation à marquer
   * @returns Observable avec la réservation mise à jour
   */
  markReservationAsUsed(reservationId: number): Observable<ReservationModel> {
    return this.http.patch<ReservationModel>(`${this.apiUrl}/reservations/${reservationId}/use`, {});
  }
  /**
   * Télécharge le billet d'une réservation
   * @param reservationId L'identifiant de la réservation
   * @returns Observable avec le blob du ticket PDF
   */
  downloadTicket(reservationId: number | undefined): Observable<Blob> {
    if (reservationId === undefined) {
      return throwError(() => new Error('ID de réservation non défini'));
    }
    return this.http.get(`${this.apiUrl}/reservations/${reservationId}/ticket`, {
      responseType: 'blob'
    });
  }
// core/services/reservation.model.ts


// Ajoutez ces méthodes si elles sont utilisées dans le mode admin et n'existent pas encore
  markAsUsed(reservationId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/reservations/${reservationId}/used`, {});
  }


}
