import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Ticket {
  id: number;
  reservationId: number;
  eventId: number;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  purchaseDate: string;
  price: number;
  finalKey: string; // Correspond à la clé utilisée dans votre backend
  isUsed: boolean;
  usageDate?: string;
  paymentInfo: {
    transactionId: string;
    method: string;
    cardLastDigits?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = `${environment.apiUrl}/tickets`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère tous les billets de l'utilisateur connecté
   */
  getUserTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/user`).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération des billets', error);
        return of([]);
      })
    );
  }

  /**
   * Récupère les détails d'un billet spécifique
   */
  getTicketById(id: string): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error(`Erreur lors de la récupération du billet ${id}`, error);
        throw error;
      })
    );
  }

  /**
   * Vérifie la validité d'un billet sans le marquer comme utilisé
   */
  checkTicketValidity(finalKey: string): Observable<boolean> {
    return this.http.get<any>(`${this.apiUrl}/check/${finalKey}`).pipe(
      map(response => !!response),
      catchError(error => {
        console.error('Erreur lors de la vérification du billet', error);
        return of(false);
      })
    );
  }

}
