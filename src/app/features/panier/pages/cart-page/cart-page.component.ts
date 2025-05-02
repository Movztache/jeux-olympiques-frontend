import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CartService } from '../../../../core/services/cart.service';
import { CartItem, CartSummary } from '../../../../core/models/cart.model';
import { CartItemComponent } from '../../components/cart-item/cart-item.component';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    CartItemComponent
  ],
  templateUrl: './cart-page.component.html',
  styleUrl: './cart-page.component.scss'
})
export class CartPageComponent implements OnInit, OnDestroy {
  // Variables pour stocker les données du panier
  cartItems: CartItem[] = [];
  cartSummary: CartSummary = { total: 0, itemCount: 0 };

  // Variable pour suivre l'état de chargement
  isLoading = true;

  // Subject pour gérer la destruction du composant et éviter les fuites mémoire
  private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Charger les éléments du panier
    this.loadCartItems();
  }

  /**
   * Charge les éléments du panier depuis le service
   */
  loadCartItems(): void {
    this.isLoading = true;

    // S'abonner aux changements des éléments du panier
    this.cartService.cartItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => {
        this.cartItems = items;
        this.isLoading = false;
      });

    // S'abonner aux changements du résumé du panier
    this.cartService.cartSummary$
      .pipe(takeUntil(this.destroy$))
      .subscribe(summary => {
        this.cartSummary = summary;
      });
  }

  /**
   * Met à jour la quantité d'un article
   */
  updateQuantity(cartId: number, quantity: number): void {
    // Éviter les quantités négatives ou nulles
    if (quantity <= 0) {
      quantity = 1;
    }

    this.cartService.updateCartItemQuantity(cartId, quantity)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (error) => console.error('Erreur lors de la mise à jour de la quantité', error)
      });
  }

  /**
   * Supprime un article du panier
   */
  removeItem(cartId: number): void {
    this.cartService.removeFromCart(cartId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (error) => console.error('Erreur lors de la suppression de l\'article', error)
      });
  }

  /**
   * Vide complètement le panier
   */
  clearCart(): void {
    if (confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
      this.cartService.clearCart()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          error: (error) => console.error('Erreur lors du vidage du panier', error)
        });
    }
  }

  /**
   * Retourne à la page des offres
   */
  continueShopping(): void {
    this.router.navigate(['/offres']);
  }

  /**
   * Passe à la page de paiement
   */
  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  ngOnDestroy(): void {
    // Nettoyer les abonnements pour éviter les fuites mémoire
    this.destroy$.next();
    this.destroy$.complete();
  }
}
