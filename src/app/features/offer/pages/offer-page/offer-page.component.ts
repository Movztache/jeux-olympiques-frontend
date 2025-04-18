import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable } from 'rxjs';

import { OfferService } from '../../../../core/services/offer.service';
import { Offer } from '../../../../core/models/offer.model';

@Component({
  selector: 'app-offer-page',
  templateUrl: './offer-page.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  styleUrls: ['./offer-page.component.scss']
})
export class OfferPageComponent implements OnInit {
  offers$: Observable<Offer[]>;
  selectedType: string | null = null;
  offerTypes: string[] = [];

  constructor(private offerService: OfferService) {
    this.offers$ = this.offerService.getAllOffers();
  }

  ngOnInit(): void {
    // Récupérer toutes les offres
    this.offers$ = this.offerService.getAllOffers();

    // Récupérer les types d'offres uniques pour le filtrage
    this.offerService.getAllOffers().subscribe(offers => {
      this.offerTypes = [...new Set(offers.map(offer => offer.offerType))];
    });
  }

  filterByType(type: string | null): void {
    this.selectedType = type;

    if (type === null) {
      this.offers$ = this.offerService.getAllOffers();
    } else {
      this.offers$ = this.offerService.getOffersByType(type);
    }
  }
}
