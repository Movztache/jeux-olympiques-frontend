import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

import { OfferService } from '../../../../core/services/offer.service';
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
    MatTooltipModule
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

  constructor(
    private offerService: OfferService,
    private router: Router
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
        this.offerTypes = [...new Set(offers.map(offer => offer.offerType))];
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

  public reserve(offer: Offer): void {
    // À implémenter plus tard logique de réservation
    // console.log('Réservation pour:', offer);
  }
}
