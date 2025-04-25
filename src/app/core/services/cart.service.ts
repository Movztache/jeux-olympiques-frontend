// src/app/core/services/cart.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Interface pour les articles du panier (basée sur votre CartItemDTO)
export interface CartItem {
  cartId: number;
  offerId: number;
  quantity: number;
  offerName: string;
  offerPrice: number;
  totalPrice: number;
}

// Interface pour le résumé du panier
export interface CartSummary {
  total: number;
  itemCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`;

  // BehaviorSubjects pour maintenir l'état du panier et le résumé
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  private cartSummarySubject = new BehaviorSubject<CartSummary>({
    total: 0,
    itemCount: 0
  });

  // Observables exposés aux composants
  public cartItems$: Observable<CartItem[]> = this.cartItemsSubject.asObservable();
  public cartSummary$: Observable<CartSummary> = this.cartSummarySubject.asObservable();

  constructor(private http: HttpClient) {
    // Charger le panier au démarrage du service
    this.loadCart();
  }

  /**
   * Charge le panier de l'utilisateur connecté depuis l'API
   */
  loadCart(): void {
    this.http.get<CartItem[]>(`${this.apiUrl}`).pipe(
      catchError(error => {
        console.error('Erreur lors du chargement du panier', error);
        return throwError(() => new Error('Erreur lors du chargement du panier'));
      }),
      tap(items => {
        this.cartItemsSubject.next(items);
        this.loadCartSummary(); // Charger le résumé du panier
      })
    ).subscribe();
  }

  /**
   * Charge le résumé du panier (total et nombre d'articles)
   */
  loadCartSummary(): void {
    this.http.get<CartSummary>(`${this.apiUrl}/summary`).pipe(
      catchError(error => {
        console.error('Erreur lors du chargement du résumé du panier', error);
        return throwError(() => new Error('Erreur lors du chargement du résumé du panier'));
      }),
      tap(summary => {
        this.cartSummarySubject.next(summary);
      })
    ).subscribe();
  }

  /**
   * Ajoute un article au panier
   * @param offerId ID de l'offre à ajouter
   * @param quantity Quantité à ajouter
   */
  addToCart(offerId: number, quantity: number): Observable<CartItem> {
    const payload: CartItem = {
      cartId: 0, // Ceci sera ignoré par le backend
      offerId: offerId,
      quantity: quantity,
      offerName: '',  // Ces champs seront remplis par le backend
      offerPrice: 0,
      totalPrice: 0
    };

    return this.http.post<CartItem>(`${this.apiUrl}/items`, payload).pipe(
      catchError(error => {
        console.error('Erreur lors de l\'ajout au panier', error);
        return throwError(() => new Error('Erreur lors de l\'ajout au panier'));
      }),
      tap(newItem => {
        // Mettre à jour la liste d'articles et le résumé
        this.loadCart();
      })
    );
  }

  /**
   * Met à jour la quantité d'un article dans le panier
   * @param cartId ID du panier à mettre à jour
   * @param quantity Nouvelle quantité
   */
  updateCartItemQuantity(cartId: number, quantity: number): Observable<CartItem> {
    return this.http.put<CartItem>(`${this.apiUrl}/items/${cartId}?quantity=${quantity}`, {}).pipe(
      catchError(error => {
        console.error('Erreur lors de la mise à jour du panier', error);
        return throwError(() => new Error('Erreur lors de la mise à jour du panier'));
      }),
      tap(updatedItem => {
        // Mettre à jour la liste d'articles et le résumé
        this.loadCart();
      })
    );
  }

  /**
   * Supprime un article du panier
   * @param cartId ID du panier à supprimer
   */
  removeFromCart(cartId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/items/${cartId}`).pipe(
      catchError(error => {
        console.error('Erreur lors de la suppression du panier', error);
        return throwError(() => new Error('Erreur lors de la suppression du panier'));
      }),
      tap(() => {
        // Mettre à jour la liste d'articles et le résumé
        this.loadCart();
      })
    );
  }

  /**
   * Vide complètement le panier
   */
  clearCart(): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}`).pipe(
      catchError(error => {
        console.error('Erreur lors de la suppression du panier', error);
        return throwError(() => new Error('Erreur lors de la suppression du panier'));
      }),
      tap(() => {
        // Mettre à jour la liste d'articles et le résumé
        this.loadCart();
      })
    );
  }

  /**
   * Calcule le nombre total d'articles dans le panier
   * (Utile pour l'affichage dans le badge du panier)
   */
  getTotalItemsCount(): number {
    return this.cartSummarySubject.value.itemCount;
  }

  /**
   * Calcule le montant total du panier
   */
  getTotalAmount(): number {
    return this.cartSummarySubject.value.total;
  }
}
