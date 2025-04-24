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
import { SeatSelectionComponent } from '../../components/seat-selection/seat-selection.component';

// Interface pour correspondre à l'interface Seat du SeatSelectionComponent
interface Seat {
  id: string;
  row: number;
  column: number;
  isAvailable: boolean;
  isSelected: boolean;
  price: number;
  category: 'standard' | 'premium' | 'vip';
}

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
    ReservationFormComponent,
    SeatSelectionComponent
  ],
  templateUrl: './create-reservation.component.html',
  styleUrls: ['./create-reservation.component.scss']
})
export class CreateReservationComponent {
  @ViewChild('stepper') stepper!: MatStepper;

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
    seats: Seat[];
  } = {
    offerId: null,
    quantity: 1,
    offerType: 'solo',
    seats: []
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

  // Gestion de la sélection des sièges
  handleSeatsSelected(seats: Seat[]): void {
    this.reservationData.seats = seats;
    this.submitReservation();
  }

  // Soumission de la réservation
  submitReservation(): void {
    if (this.isSubmitting) return;

    this.isSubmitting = true;

    const reservationDto: CreateReservationDto = {
      quantity: this.reservationData.quantity,
      offerId: this.reservationData.offerId as number
    };

    this.reservationsService.createReservation(reservationDto).subscribe({
      next: (response: ReservationModel) => {
        this.snackBar.open('Réservation créée avec succès!', 'Fermer', {
          duration: 3000
        });
        this.router.navigate(['/reservations/confirmation', response.reservationId]);
      },
      error: (error) => {
        console.error('Erreur lors de la création de la réservation', error);
        this.snackBar.open('Erreur lors de la création de la réservation. Veuillez réessayer.', 'Fermer', {
          duration: 5000
        });
        this.isSubmitting = false;
      }

    });
  }
}
