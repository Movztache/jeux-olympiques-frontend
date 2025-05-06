import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

import { OfferService } from '../../../../core/services/offer.service';
import { Offer, isOfferAvailable } from '../../../../core/models/offer.model';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

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
    MatProgressSpinnerModule,
    MatDialogModule,
    ButtonComponent
  ],
  templateUrl: './offer-detail.component.html',
  styleUrls: ['./offer-detail.component.scss']
})
export class OfferDetailComponent implements OnInit {
  offer$!: Observable<Offer | null>;
  loading = true;
  error: string | null = null;

  // Fonction utilitaire pour vérifier la disponibilité d'une offre
  isOfferAvailable = isOfferAvailable;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private offerService: OfferService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.offer$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (!id) {
          this.error = "Identifiant d'offre manquant";
          this.loading = false;
          return of(null);
        }

        return this.offerService.getOfferById(+id).pipe(
          catchError(err => {
            this.error = "Impossible de charger les détails de l'offre";
            console.error(err);
            this.loading = false;
            return of(null);
          })
        );
      })
    );

    this.offer$.subscribe(offer => {
      this.loading = false;
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/offers']);
  }

  editOffer(offer: Offer): void {
    this.router.navigate(['/admin/offers/edit', offer.offerId]);
  }

  toggleOfferAvailability(offer: Offer): void {
    const currentAvailability = isOfferAvailable(offer);
    const newAvailability = !currentAvailability;
    const action = newAvailability ? 'activer' : 'désactiver';

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        title: `Confirmer le changement de disponibilité`,
        message: `Êtes-vous sûr de vouloir ${action} l'offre "${offer.name}" ?`,
        confirmText: 'Confirmer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.offerService.updateOfferAvailability(offer.offerId, newAvailability).subscribe({
          next: (updatedOffer) => {
            // Recharger les détails de l'offre
            this.offer$ = this.offerService.getOfferById(offer.offerId);
            this.loading = false;
          },
          error: (err) => {
            this.error = `Erreur lors de la mise à jour de la disponibilité de l'offre.`;
            console.error(err);
            this.loading = false;
          }
        });
      }
    });
  }

  deleteOffer(offer: Offer): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        title: 'Confirmer la suppression',
        message: `Êtes-vous sûr de vouloir supprimer l'offre "${offer.name}" ?`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.offerService.deleteOffer(offer.offerId).subscribe({
          next: () => {
            this.router.navigate(['/admin/offers']);
          },
          error: (err) => {
            this.error = "Erreur lors de la suppression de l'offre.";
            console.error(err);
            this.loading = false;
          }
        });
      }
    });
  }
}
