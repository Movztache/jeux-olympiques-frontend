import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

import { OfferService } from '../../../../core/services/offer.service';
import { CartService } from '../../../../core/services/cart.service';
import { Offer, isOfferAvailable } from '../../../../core/models/offer.model';

@Component({
  selector: 'app-offer-page',
  templateUrl: 'offer-page.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatTooltipModule,
    MatSnackBarModule,
    FormsModule
  ],
  styleUrls: ['./offer-page.component.scss']
})
export class OfferPageComponent implements OnInit {
  offers$: Observable<Offer[]>;
  allOffers: Offer[] = [];
  filteredOffers: Offer[] = [];
  selectedType: string | null = null;
  showOnlyAvailable: boolean = false;
  offerTypes: string[] = [];
  error: string | null = null;

  // Map pour stocker les quantités par offre
  quantityMap: Map<number, number> = new Map<number, number>();

  constructor(
    private offerService: OfferService,
    private router: Router,
    private cartService: CartService,
    private snackBar: MatSnackBar
  ) {
    this.offers$ = this.offerService.getAllOffers();
    // console.log('OffresComponent - constructeur');
  }

  // Fonction pour vérifier si une offre est disponible (utilisée dans le template)
  isOfferAvailable(offer: Offer): boolean {
    return isOfferAvailable(offer);
  }

  ngOnInit(): void {
    // Récupérer toutes les offres
    this.loadOffers();
  }

  loadOffers(): void {
    this.offerService.getAllOffers().subscribe(
      offers => {
        console.log('Offres reçues du backend:', offers);
        console.log('Nombre d\'offres disponibles:', offers.filter(o => isOfferAvailable(o)).length);
        console.log('Nombre d\'offres non disponibles:', offers.filter(o => !isOfferAvailable(o)).length);

        this.allOffers = offers;
        this.applyFilters();

        // Récupérer les types d'offres uniques pour le filtrage
        // Définir l'ordre logique des types d'offres
        const orderMap: { [key: string]: number } = { 'SOLO': 1, 'DUO': 2, 'TRIO': 3, 'CUSTOM': 4 };

        // Récupérer les types uniques et les trier selon l'ordre défini
        this.offerTypes = [...new Set(offers.map(offer => offer.offerType))]
          .sort((a, b) => (orderMap[a] || 999) - (orderMap[b] || 999));
      },
      err => {
        this.error = "Impossible de charger les offres";
        console.error('Erreur lors du chargement des offres:', err);
      }
    );
  }

  filterByType(type: string | null): void {
    this.selectedType = type;
    this.applyFilters();
  }

  toggleAvailabilityFilter(): void {
    this.showOnlyAvailable = !this.showOnlyAvailable;
    this.applyFilters();
  }

  applyFilters(): void {
    // Filtrer d'abord par type si nécessaire
    let filtered = this.allOffers;

    if (this.selectedType !== null) {
      filtered = filtered.filter(offer => offer.offerType === this.selectedType);
    }

    // Ensuite filtrer par disponibilité si nécessaire
    if (this.showOnlyAvailable) {
      filtered = filtered.filter(offer => isOfferAvailable(offer));
    }

    this.filteredOffers = filtered;
    this.offers$ = new Observable<Offer[]>(observer => {
      observer.next(this.filteredOffers);
      observer.complete();
    });
  }

  viewOfferDetails(offer: Offer): void {
    this.router.navigate(['/offres', offer.offerId]);
  }

  public goBack(): void {
    this.router.navigate(['/']);
  }

  /**
   * Obtient la quantité pour une offre spécifique
   * @param offerId ID de l'offre
   * @returns La quantité pour cette offre (par défaut 1)
   */
  getQuantity(offerId: number): number {
    return this.quantityMap.get(offerId) || 1;
  }

  /**
   * Augmente la quantité pour une offre spécifique
   * @param offerId ID de l'offre
   */
  increaseQuantity(offerId: number): void {
    const currentQuantity = this.getQuantity(offerId);
    this.quantityMap.set(offerId, currentQuantity + 1);
  }

  /**
   * Diminue la quantité pour une offre spécifique
   * @param offerId ID de l'offre
   */
  decreaseQuantity(offerId: number): void {
    const currentQuantity = this.getQuantity(offerId);
    if (currentQuantity > 1) {
      this.quantityMap.set(offerId, currentQuantity - 1);
    }
  }

  /**
   * Ajoute une offre au panier
   * @param offer L'offre à ajouter au panier
   */
  public reserve(offer: Offer): void {
    if (!this.isOfferAvailable(offer)) {
      this.snackBar.open("Cette offre n'est pas disponible à la réservation.", "Fermer", {
        duration: 3000,
        panelClass: ['error-snackbar'],
        verticalPosition: 'top'
      });
      return;
    }

    const quantity = this.getQuantity(offer.offerId);

    // Ajouter l'offre au panier
    this.cartService.addToCart(offer.offerId, quantity).subscribe({
      next: (cartItem) => {
        // Afficher un message de succès
        this.snackBar.open(`${offer.name} a été ajouté à votre panier`, "Voir le panier", {
          duration: 5000,
          panelClass: ['success-snackbar'],
          verticalPosition: 'top',
        }).onAction().subscribe(() => {
          this.router.navigate(['/panier']);
        });

        // Réinitialiser la quantité à 1 après l'ajout au panier
        this.quantityMap.set(offer.offerId, 1);
      },
      error: (error) => {
        console.error('Erreur lors de l\'ajout au panier', error);
        this.snackBar.open("Une erreur est survenue lors de l'ajout au panier", "Fermer", {
          duration: 3000,
          panelClass: ['error-snackbar'],
          verticalPosition: 'top'
        });
      }
    });
  }
}
