import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable, switchMap, of, catchError } from 'rxjs';

import { OfferService } from '../../../../core/services/offer.service';
import { Offer } from '../../../../core/models/offer.model';

@Component({
  selector: 'app-offer-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
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
  offer$!: Observable<Offer | null>;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private offerService: OfferService
  ) {}

  ngOnInit(): void {
    this.offer$ = this.route.paramMap.pipe(
      switchMap(params => {
        const idParam = params.get('id');
        if (!idParam) {
          return of(null);
        }
        // Convertir l'ID en nombre
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

  reserve(offer: Offer): void {
    // À implémenter plus tard logique de réservation
    console.log('Réservation pour:', offer);
  }
}
