// src/app/core/services/payment.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay, map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PaymentInfo, PaymentResult } from '../models/payment.model';
import { ReservationCreateDTO, ReservationResponseDTO } from '../models/reservation.model';
import { CartService } from './cart.service';
import { AuthService } from '../authentication/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/reservations`;

  constructor(
    private http: HttpClient,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  /**
   * Traite le paiement et crée une réservation
   * @param paymentInfo Informations de paiement
   * @returns Observable avec le résultat de la réservation
   */
  processPayment(paymentInfo: PaymentInfo): Observable<ReservationResponseDTO[]> {
    // Récupérer les articles du panier
    let cartItems: any[] = [];
    this.cartService.cartItems$.subscribe(items => {
      cartItems = items;
    });

    if (cartItems.length === 0) {
      return throwError(() => new Error('Le panier est vide'));
    }

    // Récupérer la clé utilisateur
    const userKey = this.authService.currentUserValue?.userKey || '';

    if (!userKey) {
      return throwError(() => new Error('Utilisateur non authentifié'));
    }

    // Formater les informations de paiement selon le format attendu par le backend
    // Format attendu: 'cardNumber|MM/YY|CVV'
    const formattedPaymentInfo = `${paymentInfo.cardNumber.replace(/\s/g, '')}|${paymentInfo.expiryDate}|${paymentInfo.cvv}`;

    // Simuler un temps de traitement pour le paiement
    return of(null).pipe(
      delay(2000), // Délai de 2 secondes pour simuler le traitement du paiement
      switchMap(() => {
        // Créer une réservation pour chaque article du panier
        const reservationRequests = cartItems.map((item: any) => {
          const reservationDTO: ReservationCreateDTO = {
            offerId: item.offerId,
            quantity: item.quantity,
            userKey: userKey,
            paymentInfo: formattedPaymentInfo
          };

          return this.http.post<any>(this.apiUrl, reservationDTO).pipe(
            map(response => response.reservation as ReservationResponseDTO)
          );
        });

        // Exécuter toutes les requêtes en parallèle
        return this.executeSequentially(reservationRequests);
      }),
      tap(() => {
        // Vider le panier après un paiement réussi
        this.cartService.clearCart().subscribe();
      }),
      catchError(error => {
        console.error('Erreur lors du traitement du paiement', error);
        return throwError(() => new Error('Erreur lors du traitement du paiement. Veuillez réessayer.'));
      })
    );
  }

  /**
   * Exécute les requêtes de réservation séquentiellement
   * @param requests Tableau d'observables de requêtes
   * @returns Observable avec les résultats des réservations
   */
  private executeSequentially(requests: Observable<ReservationResponseDTO>[]): Observable<ReservationResponseDTO[]> {
    // Si aucune requête, retourner un tableau vide
    if (requests.length === 0) {
      return of([]);
    }

    // Exécuter les requêtes séquentiellement
    const result: ReservationResponseDTO[] = [];

    return new Observable<ReservationResponseDTO[]>(observer => {
      let index = 0;

      const executeNext = () => {
        if (index >= requests.length) {
          observer.next(result);
          observer.complete();
          return;
        }

        requests[index].subscribe({
          next: (response) => {
            result.push(response);
            index++;
            executeNext();
          },
          error: (error) => {
            observer.error(error);
          }
        });
      };

      executeNext();
    });
  }

  /**
   * Récupère une réservation par son ID
   * @param id ID de la réservation
   * @returns Observable avec les détails de la réservation
   */
  getReservationById(id: number): Observable<ReservationResponseDTO> {
    return this.http.get<ReservationResponseDTO>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error(`Erreur lors de la récupération de la réservation ${id}`, error);
        return throwError(() => new Error('Erreur lors de la récupération de la réservation'));
      })
    );
  }

  /**
   * Valide les informations de carte de crédit
   * @param cardNumber Numéro de carte
   * @returns true si le numéro de carte est valide, false sinon
   */
  validateCreditCard(cardNumber: string): boolean {
    // Supprimer les espaces et tirets
    const sanitizedNumber = cardNumber.replace(/[\s-]/g, '');

    // Vérifier que la carte contient uniquement des chiffres
    if (!/^\d+$/.test(sanitizedNumber)) {
      return false;
    }

    // Vérifier la longueur (la plupart des cartes ont entre 13 et 19 chiffres)
    if (sanitizedNumber.length < 13 || sanitizedNumber.length > 19) {
      return false;
    }

    // Algorithme de Luhn pour vérifier la validité du numéro de carte
    let sum = 0;
    let double = false;

    // Parcourir les chiffres de droite à gauche
    for (let i = sanitizedNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(sanitizedNumber.charAt(i));

      if (double) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      double = !double;
    }

    // Le numéro est valide si la somme est divisible par 10
    return sum % 10 === 0;
  }
}
