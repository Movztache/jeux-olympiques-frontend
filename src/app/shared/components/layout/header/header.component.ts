import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { AuthService } from '../../../../core/authentication/auth.service';
import { CartService } from '../../../../core/services/cart.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatMenuModule
  ]
})
export class HeaderComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  isLoggedIn = false;
  isAdmin = false;
  cartItemsCount = 0;
  adminMenuOpen = false;
  userMenuOpen = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    // Utiliser directement isLoggedIn() pour l'état initial
    this.isLoggedIn = this.authService.isLoggedIn();

    // Vérifier si l'utilisateur est administrateur
    this.isAdmin = this.authService.hasRole("Admin");

    // S'abonner aux changements d'utilisateur pour mettre à jour l'état de connexion
    const authSub = this.authService.currentUser.subscribe(user => {
      this.isLoggedIn = !!user;
      this.isAdmin = user ? this.authService.hasRole('Admin') : false;
    });
    this.subscriptions.push(authSub);

    // S'abonner au nombre d'articles dans le panier en utilisant le cartItems$ existant
    const cartSub = this.cartService.cartItems$.subscribe(items => {
      this.cartItemsCount = items?.length || 0;
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

  // Méthodes pour gérer l'ouverture au survol
  openAdminMenu(): void {
    this.adminMenuOpen = true;
    this.userMenuOpen = false;
  }

  closeAdminMenu(): void {
    // Utiliser un délai pour éviter la fermeture immédiate
    // ce qui permettra le survol du contenu du menu
    setTimeout(() => {
      if (!this.isHoveringAdminDropdown) {
        this.adminMenuOpen = false;
      }
    }, 100);
  }

  openUserMenu(): void {
    this.userMenuOpen = true;
    this.adminMenuOpen = false;
  }

  closeUserMenu(): void {
    // Utiliser un délai pour éviter la fermeture immédiate
    setTimeout(() => {
      if (!this.isHoveringUserDropdown) {
        this.userMenuOpen = false;
      }
    }, 100);
  }

  // Variables pour suivre l'état du survol
  isHoveringAdminDropdown = false;
  isHoveringUserDropdown = false;

  // Méthodes pour suivre si on survole le contenu du menu déroulant
  onAdminDropdownEnter(): void {
    this.isHoveringAdminDropdown = true;
  }

  onAdminDropdownLeave(): void {
    this.isHoveringAdminDropdown = false;
    this.closeAdminMenu();
  }

  onUserDropdownEnter(): void {
    this.isHoveringUserDropdown = true;
  }

  onUserDropdownLeave(): void {
    this.isHoveringUserDropdown = false;
    this.closeUserMenu();
  }

  logout(): void {
    this.authService.logout();
    this.isMenuOpen = false;
    this.userMenuOpen = false;
  }
}
