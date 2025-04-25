// header.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../../core/authentication/auth.service';
import { CartService } from '../../../../core/services/cart.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule
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

    // S'abonner au nombre d'articles dans le panier en utilisant le cartItems$ existant
    const cartSub = this.cartService.cartItems$.subscribe(items => {
      this.cartItemsCount = items?.length || 0;
    });
    this.subscriptions.push(cartSub);

    // Alternative: vous pourriez également utiliser le cartSummary$ si vous préférez
    // const summarySub = this.cartService.cartSummary$.subscribe(summary => {
    //   this.cartItemsCount = summary.itemCount;
    // });
    // this.subscriptions.push(summarySub);
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
