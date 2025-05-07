// offer-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { Observable, switchMap, of, catchError } from 'rxjs';

import { OfferService } from '../../../../core/services/offer.service'; // Assurez-vous que le chemin est correct
import { Offer, isOfferAvailable } from '../../../../core/models/offer.model'; // Assurez-vous que le chemin est correct

@Component({
  selector: 'app-offer-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './offer-detail.component.html',
  styleUrls: ['./offer-detail.component.scss']
})
export class OfferDetailComponent implements OnInit {
  public offer$: Observable<Offer | null> = of(null);
  public error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private offerService: OfferService
  ) {
    // Initialiser offer$ pour éviter l'erreur !
    this.offer$ = of(null);
  }

  ngOnInit(): void {
    this.offer$ = this.route.paramMap.pipe(
      switchMap(params => {
        const idParam = params.get('id');
        if (!idParam) {
          this.error = "Identifiant d'offre manquant";
          return of(null);
        }
        const id = parseInt(idParam, 10);
        if (isNaN(id)) {
          this.error = "Identifiant d'offre invalide";
          return of(null);
        }
        return this.offerService.getOfferById(id).pipe(
          catchError(err => {
            this.error = "Impossible de charger les détails de l'offre";
            console.error(err);
            return of(null);
          })
        );
      })
    );
  }

  goBack(): void {
    this.router.navigate(['/offres']);
  }

  // Fonction pour vérifier si une offre est disponible (utilisée dans le template)
  isOfferAvailable(offer: Offer): boolean {
    return isOfferAvailable(offer);
  }

  reserve(offer: Offer): void {
    if (!this.isOfferAvailable(offer)) {
      alert("Cette offre n'est pas disponible à la réservation.");
      return;
    }

    console.log('Réservation pour:', offer);
  }
}
