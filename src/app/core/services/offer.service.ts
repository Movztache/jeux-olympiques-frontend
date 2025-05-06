import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Offer } from '../models/offer.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OfferService {
  private apiUrl = `${environment.apiUrl}/offers`;

  constructor(private http: HttpClient) { }

  getAllOffers(): Observable<Offer[]> {
    // console.log('Appel API getAllOffers:', this.apiUrl);
    return this.http.get<Offer[]>(this.apiUrl);
  }

  getOfferById(id: number): Observable<Offer> {
    return this.http.get<Offer>(`${this.apiUrl}/${id}`);
  }

  getOffersByType(offerType: string): Observable<Offer[]> {
    return this.http.get<Offer[]>(`${this.apiUrl}/type/${offerType}`);
  }

  /**
   * Crée une nouvelle offre ou met à jour une offre existante
   * @param offer L'offre à sauvegarder
   * @returns L'offre sauvegardée avec son ID
   */
  saveOffer(offer: Offer): Observable<Offer> {
    if (offer.offerId) {
      // Si l'offre a un ID, on utilise PUT pour la mettre à jour
      return this.updateOffer(offer.offerId, offer);
    } else {
      // Sinon, on utilise POST pour créer une nouvelle offre
      return this.http.post<Offer>(this.apiUrl, offer);
    }
  }

  /**
   * Met à jour une offre existante
   * @param id L'ID de l'offre à mettre à jour
   * @param offer Les nouvelles données de l'offre
   * @returns L'offre mise à jour
   */
  updateOffer(id: number, offer: Offer): Observable<Offer> {
    return this.http.put<Offer>(`${this.apiUrl}/${id}`, offer);
  }

  /**
   * Met à jour uniquement la disponibilité d'une offre
   * @param id L'ID de l'offre à mettre à jour
   * @param available La nouvelle valeur de disponibilité
   * @returns L'offre mise à jour
   */
  updateOfferAvailability(id: number, available: boolean): Observable<Offer> {
    // Utiliser PATCH avec le paramètre de requête comme prévu par le backend
    const params = new HttpParams().set('available', available.toString());
    return this.http.patch<Offer>(`${this.apiUrl}/${id}/availability`, null, { params });
  }

  /**
   * Supprime une offre
   * @param id L'ID de l'offre à supprimer
   * @returns Void
   */
  deleteOffer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Vérifie si une offre existe par son ID
   * @param id L'ID de l'offre à vérifier
   * @returns True si l'offre existe, false sinon
   */
  existsById(id: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists/${id}`);
  }
}
