// header.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../../core/authentication/auth.service';
import { CartService } from '../../../../core/services/cart.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon'; // Ajouté pour les icônes Material

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule // Nécessaire pour les balises <span class="material-icons">
  ]
})
export class HeaderComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  isLoggedIn = false;
  cartItemsCount = 0;
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    // Utiliser directement isLoggedIn() pour l'état initial
    this.isLoggedIn = this.authService.isLoggedIn();

    // S'abonner aux changements d'utilisateur pour mettre à jour l'état de connexion
    const authSub = this.authService.currentUser.subscribe(user => {
      this.isLoggedIn = !!user;
    });
    this.subscriptions.push(authSub);

    // S'abonner au nombre d'articles dans le panier
    const cartSub = this.cartService.cart$.subscribe(cart => {
      this.cartItemsCount = cart?.items?.length || 0;
    });
    this.subscriptions.push(cartSub);
  }

  ngOnDestroy(): void {
    // Désabonner toutes les souscriptions pour éviter les fuites de mémoire
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(): void {
    this.authService.logout();
    this.isMenuOpen = false;
  }
}
