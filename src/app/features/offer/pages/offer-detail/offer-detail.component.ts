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
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { Observable, switchMap, of, catchError } from 'rxjs';

import { OfferService } from '../../../../core/services/offer.service'; // Assurez-vous que le chemin est correct
import { CartService } from '../../../../core/services/cart.service';
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
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    FormsModule
  ],
  templateUrl: './offer-detail.component.html',
  styleUrls: ['./offer-detail.component.scss']
})
export class OfferDetailComponent implements OnInit {
  public offer$: Observable<Offer | null> = of(null);
  public error: string | null = null;

  // Variable pour stocker la quantité à réserver
  quantity: number = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private offerService: OfferService,
    private cartService: CartService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
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

  /**
   * Ouvre une boîte de dialogue pour confirmer la réservation
   * @param offer L'offre à réserver
   */
  reserve(offer: Offer): void {
    if (!this.isOfferAvailable(offer)) {
      this.snackBar.open("Cette offre n'est pas disponible à la réservation.", "Fermer", {
        duration: 3000,
        panelClass: ['error-snackbar'],
        verticalPosition: 'top'
      });
      return;
    }

    // Ajouter l'offre au panier
    this.cartService.addToCart(offer.offerId, this.quantity).subscribe({
      next: (cartItem) => {
        // Afficher un message de succès
        this.snackBar.open(`${offer.name} a été ajouté à votre panier`, "Voir le panier", {
          duration: 5000,
          panelClass: ['success-snackbar'],
          verticalPosition: 'top'
        }).onAction().subscribe(() => {
          this.router.navigate(['/panier']);
        });
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
