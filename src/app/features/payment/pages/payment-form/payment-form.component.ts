// src/app/features/payment/payment-form/payment-form.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../core/authentication/auth.service';
import { ReservationCreateDTO, ReservationResponseDTO } from '../../../../core/models/reservation.model';
import { CartService } from '../../../../core/services/cart.service';
import { CartItem } from '../../../../core/models/cart.model';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss']
})
export class PaymentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private reservationId: number | null = null;
  private apiUrl = `${environment.apiUrl}/reservations`;

  paymentForm!: FormGroup;
  isProcessing = false;
  isCardVisible = false; // Variable pour suivre si la carte est visible ou non

  // Total du panier
  orderTotal = 0;
  // Détails de l'événement (pour la compatibilité avec le code existant)
  eventDetails = { name: 'Billets Jeux Olympiques', date: '2024-07-26', time: '10:00' };

  ngOnInit(): void {
    // Récupérer le total du panier
    this.cartService.cartSummary$.subscribe(summary => {
      this.orderTotal = summary.total;
    });

    // Récupérer les paramètres de navigation (si disponibles)
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      const state = navigation.extras.state as any;
      // Utiliser les paramètres de navigation seulement s'ils sont disponibles
      if (state.orderTotal) this.orderTotal = state.orderTotal;
      if (state.eventDetails) this.eventDetails = state.eventDetails;
      if (state.reservationId) this.reservationId = state.reservationId;
    }

    this.paymentForm = this.fb.group({
      cardHolderName: ['', [Validators.required]],
      cardNumber: ['', [Validators.required, Validators.pattern('[0-9]{16}')]],
      expiryDate: ['', [Validators.required, Validators.pattern('(0[1-9]|1[0-2])\\/[0-9]{2}')]],
      cvv: ['', [Validators.required, Validators.pattern('[0-9]{3,4}')]]
    });
  }

  /**
   * Formate le numéro de carte pour l'affichage dans la prévisualisation
   * @param cardNumber Numéro de carte à formater
   * @returns Numéro de carte formaté
   */
  formatCardNumber(cardNumber: string): string {
    if (!cardNumber) {
      return '\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022';
    }

    // Ajouter des espaces tous les 4 chiffres
    let formattedValue = '';
    for (let i = 0; i < cardNumber.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formattedValue += ' ';
      }
      formattedValue += cardNumber[i];
    }

    // Compléter avec des points si nécessaire
    const missingDigits = 16 - cardNumber.length;
    if (missingDigits > 0) {
      let padding = '';
      for (let i = 0; i < missingDigits; i++) {
        if ((cardNumber.length + i) % 4 === 0 && i > 0) {
          padding += ' ';
        }
        padding += '\u2022';
      }
      formattedValue += padding;
    }

    return formattedValue;
  }

  /**
   * Annule le paiement et retourne à la page d'accueil
   */
  cancelPayment(): void {
    // Afficher une confirmation avant d'annuler
    if (confirm('Êtes-vous sûr de vouloir annuler le paiement ?')) {
      this.router.navigate(['/']);
    }
  }

  /**
   * Retourne à la page du panier
   */
  backToCart(): void {
    this.router.navigate(['/panier']);
  }

  /**
   * Bascule la visibilité de la carte
   */
  toggleCardVisibility(): void {
    this.isCardVisible = !this.isCardVisible;
  }

  onSubmit(): void {
    if (this.paymentForm.valid) {
      this.isProcessing = true;

      // Récupérer l'utilisateur courant
      const currentUser = this.authService.currentUserValue;

      // Utiliser l'email ou l'userId comme clé utilisateur
      const userKey = currentUser?.email || currentUser?.userId?.toString() || '';
      if (!userKey) {
        this.snackBar.open('Vous devez être connecté pour effectuer un paiement', 'Fermer', {
          duration: 5000,
          verticalPosition: 'top'
        });
        this.isProcessing = false;
        return;
      }

      // Formater les informations de paiement selon le format attendu par le backend
      // Format attendu: 'cardNumber|MM/YY|CVV'
      const cardNumber = this.paymentForm.get('cardNumber')?.value || '';
      const expiryDate = this.paymentForm.get('expiryDate')?.value || '';
      const cvv = this.paymentForm.get('cvv')?.value || '';
      const formattedPaymentInfo = `${cardNumber.replace(/\s/g, '')}|${expiryDate}|${cvv}`;

      // Récupérer les articles du panier
      let cartItems: CartItem[] = [];
      this.cartService.cartItems$.subscribe(items => {
        cartItems = items;
      });

      if (cartItems.length === 0) {
        this.isProcessing = false;
        this.snackBar.open('Votre panier est vide', 'Fermer', {
          duration: 3000,
          verticalPosition: 'top'
        });
        return;
      }

      // Créer une réservation pour chaque article du panier
      const reservationPromises = cartItems.map(item => {
        // Créer l'objet de réservation
        const reservationDTO: ReservationCreateDTO = {
          offerId: item.offerId,
          quantity: item.quantity,
          paymentInfo: formattedPaymentInfo
        };

        console.log('Reservation DTO:', reservationDTO);

        // Retourner une promesse pour la réservation
        return this.http.post<any>(`${this.apiUrl}`, reservationDTO).toPromise();
      });

      // Traiter toutes les réservations
      Promise.all(reservationPromises)
        .then(responses => {
          this.isProcessing = false;
          console.log('Responses from server:', responses);

          // Récupérer les réservations créées
          const reservations = responses.map(response => {
            return response.reservation ? response.reservation : response;
          });

          // Vider le panier après un paiement réussi
          this.cartService.clearCart().subscribe();

          // Rediriger vers la page de confirmation
          this.router.navigate(['/payment/confirmation'], {
            state: {
              reservations: reservations,
              payment: {
                transactionId: 'TXN-' + Math.floor(Math.random() * 10000000),
                cardLastDigits: cardNumber.slice(-4),
                paymentMethod: 'Carte de crédit',
                status: 'Paiement accepté'
              }
            }
          });
        })
        .catch(error => {
          this.isProcessing = false;
          console.error('Erreur lors de la création des réservations', error);
          console.log('Error details:', error.error);

          let errorMessage = 'Une erreur est survenue lors du traitement du paiement';

          if (error.status === 402) {
            errorMessage = 'Erreur de paiement: ' + (error.error?.message || 'Votre carte a été refusée.');
          } else if (error.status === 400) {
            errorMessage = 'Erreur de validation: ' + (error.error?.message || 'Veuillez vérifier vos informations.');
          } else if (error.status === 403) {
            errorMessage = 'Erreur d\'authentification: ' + (error.error?.message || 'Veuillez vous reconnecter.');
          } else if (error.error && typeof error.error === 'object') {
            // Essayer d'extraire un message d'erreur plus spécifique
            const errorObj = error.error;
            if (errorObj.message) {
              errorMessage = errorObj.message;
            } else if (errorObj.error) {
              errorMessage = errorObj.error;
            }
          }

          this.snackBar.open(errorMessage, 'Fermer', {
            duration: 5000,
            verticalPosition: 'top'
          });
        });
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      this.paymentForm.markAllAsTouched();

      this.snackBar.open('Veuillez corriger les erreurs dans le formulaire', 'Fermer', {
        duration: 3000,
        verticalPosition: 'top'
      });
    }
  }
}
