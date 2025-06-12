import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { Observable, Subject, interval, map, takeUntil, startWith, switchMap, catchError, of } from 'rxjs';

import { OfferService } from '../../../core/services/offer.service';
import { Offer, isOfferAvailable } from '../../../core/models/offer.model';

@Component({
  selector: 'app-ticket-carousel',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './ticket-carousel.component.html',
  styleUrls: ['./ticket-carousel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketCarouselComponent implements OnInit, OnDestroy {
  availableOffers: Offer[] = [];
  displayedOffers: Offer[] = [];
  maxDisplayed = 4; // Changé à 4 comme demandé
  maxDisplayedMobile = 5; // Maximum 5 sur mobile
  isLoading = true;
  error: string | null = null;
  isMobile = false;

  private destroy$ = new Subject<void>();
  private resizeHandler!: () => void; // Optimisation : Utiliser definite assignment assertion
  private isDestroyed = false;

  // Optimisation : Cache pour éviter les recalculs répétés
  private cachedValidOffers: Offer[] = [];
  private lastOffersHash = '';
  private cachedDisplayData: { mobile: Offer[], desktop: Offer[] } = { mobile: [], desktop: [] };
  
  constructor(
    private offerService: OfferService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    // Optimisation : Créer le handler une seule fois pour éviter les fuites mémoire
    this.resizeHandler = this.debounce(() => {
      if (!this.isDestroyed) {
        this.checkIfMobile();
      }
    }, 250); // Debounce de 250ms pour optimiser les performances
  }

  ngOnInit(): void {
    this.checkIfMobile();
    this.loadAvailableOffers();

    // Optimisation : Utiliser le handler pré-créé avec debounce
    window.addEventListener('resize', this.resizeHandler, { passive: true });
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.destroy$.next();
    this.destroy$.complete();

    // Optimisation : Nettoyer proprement l'event listener
    window.removeEventListener('resize', this.resizeHandler);

    // Optimisation : Nettoyer les caches pour libérer la mémoire
    this.cachedValidOffers = [];
    this.cachedDisplayData = { mobile: [], desktop: [] };
    this.typeLabelsCache.clear();
    this.priceCache.clear();
    this.lastOffersHash = '';
  }

  /**
   * Optimisation : Chargement des offres avec cache et validation optimisée
   */
  private loadAvailableOffers(): void {
    this.offerService.getAllOffers()
      .pipe(
        map(offers => this.filterAndCacheValidOffers(offers)),
        catchError(err => {
          console.error('Erreur lors du chargement des offres:', err);
          this.error = 'Impossible de charger les billets disponibles';
          return of([]);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(offers => {
        this.availableOffers = offers;
        this.prepareCarouselDataWithCache();
        this.isLoading = false;
        this.cdr.markForCheck();
      });
  }

  /**
   * Optimisation : Filtrage et mise en cache des offres valides
   */
  private filterAndCacheValidOffers(offers: Offer[]): Offer[] {
    // Optimisation : Créer un hash pour détecter les changements
    const offersHash = JSON.stringify(offers.map(o => ({ id: o.offerId, name: o.name, price: o.price })));

    if (this.lastOffersHash === offersHash && this.cachedValidOffers.length > 0) {
      return this.cachedValidOffers;
    }

    // Optimisation : Filtrage optimisé avec validation en une passe
    this.cachedValidOffers = offers.filter(offer =>
      isOfferAvailable(offer) &&
      offer.name?.trim() &&
      offer.price > 0
    );

    this.lastOffersHash = offersHash;
    return this.cachedValidOffers;
  }

  /**
   * Optimisation : Fonction debounce pour limiter les appels fréquents
   * Améliore les performances en évitant les recalculs excessifs
   */
  private debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
    let timeout: any; // Optimisation : Utiliser any pour éviter les problèmes de types NodeJS
    return ((...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    }) as T;
  }

  /**
   * Optimisation : Détection mobile avec invalidation intelligente du cache
   */
  private checkIfMobile(): void {
    const newIsMobile = window.innerWidth <= 480;

    // Optimisation : Ne recalculer que si l'état mobile a changé
    if (this.isMobile !== newIsMobile) {
      this.isMobile = newIsMobile;

      // Optimisation : Invalider le cache lors du changement de mode
      this.cachedDisplayData = { mobile: [], desktop: [] };

      if (this.availableOffers.length > 0) {
        this.prepareCarouselDataWithCache();
        this.cdr.markForCheck();
      }
    }
  }

  /**
   * Optimisation : Préparation des données avec cache avancé
   */
  private prepareCarouselDataWithCache(): void {
    if (this.availableOffers.length === 0) {
      this.displayedOffers = [];
      this.cachedDisplayData = { mobile: [], desktop: [] };
      return;
    }

    // Optimisation : Utiliser le cache si disponible
    if (this.isMobile && this.cachedDisplayData.mobile.length > 0) {
      this.displayedOffers = this.cachedDisplayData.mobile;
      return;
    }

    if (!this.isMobile && this.cachedDisplayData.desktop.length > 0) {
      this.displayedOffers = this.cachedDisplayData.desktop;
      return;
    }

    // Optimisation : Calculer et mettre en cache
    if (this.isMobile) {
      this.cachedDisplayData.mobile = this.availableOffers.slice(0, this.maxDisplayedMobile);
      this.displayedOffers = this.cachedDisplayData.mobile;
    } else {
      this.cachedDisplayData.desktop = this.calculateDesktopDisplayData();
      this.displayedOffers = this.cachedDisplayData.desktop;
    }
  }

  /**
   * Optimisation : Calcul optimisé des données desktop avec algorithme amélioré
   */
  private calculateDesktopDisplayData(): Offer[] {
    const offersLength = this.availableOffers.length;

    if (offersLength < this.maxDisplayed) {
      // Optimisation : Calcul du multiplicateur avec performance optimisée
      const multiplier = Math.max(3, Math.ceil((this.maxDisplayed * 3) / offersLength));
      return Array.from({ length: multiplier }, () => this.availableOffers).flat();
    } else {
      // Optimisation : Duplication optimisée pour les performances
      return this.availableOffers.concat(this.availableOffers, this.availableOffers);
    }
  }

  onOfferClick(offer: Offer): void {
    this.router.navigate(['/offres', offer.offerId]);
  }

  // Optimisation : Cache pour les labels de types
  private readonly typeLabelsCache = new Map<string, string>([
    ['SOLO', 'Solo'],
    ['DUO', 'Duo'],
    ['TRIO', 'Trio'],
    ['CUSTOM', 'Groupe']
  ]);

  /**
   * Optimisation : Méthode optimisée avec cache pour les labels
   */
  getOfferTypeLabel(offerType: string): string {
    return this.typeLabelsCache.get(offerType) || offerType;
  }

  /**
   * Optimisation : TrackBy function optimisée pour les performances de rendu
   */
  trackByOfferId(index: number, offer: Offer): number {
    return offer.offerId;
  }

  /**
   * Optimisation : Validation optimisée avec vérification rapide
   */
  hasValidDescription(offer: Offer): boolean {
    return !!(offer.description?.trim());
  }

  /**
   * Optimisation : Formatage de prix avec cache pour éviter les recalculs
   */
  private priceCache = new Map<number, string>();

  getDisplayPrice(offer: Offer): string {
    if (this.priceCache.has(offer.price)) {
      return this.priceCache.get(offer.price)!;
    }

    const formattedPrice = offer.price.toFixed(2);
    this.priceCache.set(offer.price, formattedPrice);
    return formattedPrice;
  }

  onViewAllOffers(): void {
    this.router.navigate(['/offres']);
  }

  get showMoreOffersLink(): boolean {
    return this.isMobile && this.availableOffers.length > this.maxDisplayedMobile;
  }
}
