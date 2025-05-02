import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReservationsService } from '../../../../core/services/reservation.service';
import { CreateReservationDto, ReservationModel } from '../../../../core/models/reservation.model';
import { ReservationFormComponent } from '../../components/reservation-form/reservation-form.component';
import { Offer } from '../../../../core/models/offer.model';


@Component({
  selector: 'app-create-reservation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatStepperModule,
    MatSnackBarModule,
    ReservationFormComponent
  ],
  templateUrl: './create-reservation.component.html',
  styleUrls: ['./create-reservation.component.scss']
})
export class CreateReservationComponent {
  @ViewChild('stepper') stepper!: MatStepper;

  selectedOffer: Offer | null = null;
  private fb = inject(FormBuilder);
  private reservationsService = inject(ReservationsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  // Étape actuelle dans le processus de réservation
  currentStep = 0;

  // Données de la réservation (adaptées aux composants)
  reservationData: {
    offerId: number | null;
    quantity: number;
    offerType: 'solo' | 'duo' | 'family';
    customerInfo?: any;
    offerPrice: number;
  } = {
    offerId: null,
    quantity: 1,
    offerType: 'solo',
    offerPrice: 0
  };

  isSubmitting = false;

  // Formulaire pour la compatibilité avec le code existant
  reservationForm: FormGroup = this.fb.group({
    quantity: [1, [Validators.required, Validators.min(1)]],
    offerId: [null, Validators.required]
  });

  constructor() {
    // Récupérer l'ID de l'offre depuis les paramètres d'URL si disponible
    this.route.queryParams.subscribe(params => {
      if (params['offerId']) {
        this.reservationData.offerId = Number(params['offerId']);
      }

      // Définir le type d'offre si disponible
      if (params['offerType']) {
        this.reservationData.offerType = params['offerType'] as 'solo' | 'duo' | 'family';
        // Ajuster la quantité en fonction du type d'offre
        switch(this.reservationData.offerType) {
          case 'solo': this.reservationData.quantity = 1; break;
          case 'duo': this.reservationData.quantity = 2; break;
          case 'family': this.reservationData.quantity = 4; break;
        }
      }
    });
  }

  // Gestion du formulaire de réservation
  handleFormSubmit(formData: any): void {
    // Stocker les infos client
    this.reservationData.customerInfo = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      specialRequests: formData.specialRequests
    };

    // Mettre à jour l'ID de l'offre si fourni
    if (formData.offerId) {
      this.reservationData.offerId = Number(formData.offerId);
    }

    // Mettre à jour la quantité
    this.reservationData.quantity = formData.ticketCount;

    // Passer à l'étape suivante (sélection des sièges)
    this.currentStep = 1;
    if (this.stepper) {
      this.stepper.next();
    }
  }

  // Soumission de la réservation
  submitReservation(): void {
    if (this.isSubmitting) return;

    this.isSubmitting = true;

    const reservationDto: CreateReservationDto = {
      offerId: this.reservationData.offerId!,
      quantity: this.reservationData.quantity
    };

    this.reservationsService.createReservation(reservationDto).subscribe({
      next: (reservation: ReservationModel) => {
        this.isSubmitting = false;

        // Rediriger vers le formulaire de paiement avec les détails nécessaires
        this.router.navigate(['/payment/form'], {
          state: {
            reservationId: reservation.reservationId,
            orderTotal: this.reservationData.offerPrice * this.reservationData.quantity,
            eventDetails: {
              name: reservation.offer.name || 'Événement',
              date: new Date(reservation.reservationDate).toLocaleDateString() || 'Date',
              time: new Date(reservation.reservationDate).toLocaleTimeString() || 'Heure'
            },
            customerInfo: this.reservationData.customerInfo // Passer les infos client si nécessaire
          }
        });
      },
      error: (error) => {
        this.isSubmitting = false;
        this.snackBar.open('Erreur lors de la création de la réservation', 'Fermer', {
          duration: 3000
        });
        console.error('Erreur de création de réservation', error);
      }
    });
  }

  confirmReservation(): void {
    // Appeler la méthode existante pour soumettre la réservation
    this.submitReservation();
  }

  // Pour calculer le prix total
  getTotalPrice(): number {
    return this.reservationData.quantity * this.reservationData.offerPrice;
  }

// Pour retourner à l'étape précédente
  goBack(): void {
    this.currentStep--;
    if (this.stepper) {
      this.stepper.previous();
    }
  }




}
