// src/app/core/services/navigation.service.ts
import { Injectable } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private navigationHistory: string[] = [];

  constructor(
    private router: Router,
    private location: Location
  ) {
    // Écoute les événements de navigation pour enregistrer l'historique
    this.router.events.subscribe(() => {
      const currentUrl = this.router.url;
      if (this.navigationHistory.length === 0 ||
        this.navigationHistory[this.navigationHistory.length - 1] !== currentUrl) {
        this.navigationHistory.push(currentUrl);

        // Limiter la taille de l'historique à 10 entrées
        if (this.navigationHistory.length > 10) {
          this.navigationHistory.shift();
        }
      }
    });
  }

  // Navigation vers les routes principales
  goToHome(): Promise<boolean> {
    return this.router.navigate(['/home']);
  }

  goToLogin(returnUrl?: string): Promise<boolean> {
    const extras: NavigationExtras = returnUrl ?
      { queryParams: { returnUrl } } : {};
    return this.router.navigate(['/login'], extras);
  }

  goToRegister(): Promise<boolean> {
    return this.router.navigate(['/inscription']);
  }

  // Routes pour la billetterie
  goToBilletterie(): Promise<boolean> {
    return this.router.navigate(['/billetterie']);
  }

  // Routes pour le panier
  goToCart(): Promise<boolean> {
    return this.router.navigate(['/panier']);
  }

  goToCheckout(): Promise<boolean> {
    return this.router.navigate(['/panier/paiement']);
  }

  goToOrderConfirmation(orderId: number): Promise<boolean> {
    return this.router.navigate(['/panier/confirmation', orderId]);
  }

  // Routes pour le profil utilisateur
  goToProfile(): Promise<boolean> {
    return this.router.navigate(['/profil']);
  }

  goToMyTickets(): Promise<boolean> {
    return this.router.navigate(['/mes-billets']);
  }

  goToTicketDetail(ticketId: number): Promise<boolean> {
    return this.router.navigate(['/mes-billets', ticketId]);
  }

  // Routes d'administration
  goToAdminDashboard(): Promise<boolean> {
    return this.router.navigate(['/admin/dashboard']);
  }

  goToAdminEvents(): Promise<boolean> {
    return this.router.navigate(['/admin/events']);
  }

  goToAdminEventEdit(eventId?: number): Promise<boolean> {
    return eventId
      ? this.router.navigate(['/admin/events/edit', eventId])
      : this.router.navigate(['/admin/events/create']);
  }

  goToAdminUsers(): Promise<boolean> {
    return this.router.navigate(['/admin/users']);
  }

  goToAdminOrders(): Promise<boolean> {
    return this.router.navigate(['/admin/orders']);
  }

  // Méthodes pour la gestion de l'historique
  goBack(): void {
    this.location.back();
  }

  goForward(): void {
    this.location.forward();
  }

  getPreviousUrl(): string | null {
    return this.navigationHistory.length > 1
      ? this.navigationHistory[this.navigationHistory.length - 2]
      : null;
  }

  // Méthodes utilitaires
  navigateWithQueryParams(route: string, params: any): Promise<boolean> {
    return this.router.navigate([route], { queryParams: params });
  }

  navigateToExternalUrl(url: string): void {
    window.open(url, '_blank');
  }

  // Redirection avec conservation de l'URL actuelle
  redirectToLoginWithReturn(): Promise<boolean> {
    return this.goToLogin(this.router.url);
  }

  // Vérification de la route actuelle
  isCurrentRoute(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route);
  }
}
