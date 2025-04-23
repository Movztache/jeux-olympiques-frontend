import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReservationsService } from '../../../../core/services/reservation';
import { CreateReservationDto } from '../../../../core/models/reservation';

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
    MatSnackBarModule
  ],
  templateUrl: './create-reservation.component.html',
  styleUrls: ['./create-reservation.component.scss']
})
export class CreateReservationComponent {
  private fb = inject(FormBuilder);
  private reservationsService = inject(ReservationsService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  reservationForm: FormGroup = this.fb.group({
    quantity: [1, [Validators.required, Validators.min(1)]],
    offerId: [null, Validators.required]
  });

  isSubmitting = false;

  submitReservation(): void {
    if (this.reservationForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const reservationData: CreateReservationDto = this.reservationForm.value;

    this.reservationsService.createReservation(reservationData).subscribe({
      next: (reservation) => {
        this.isSubmitting = false;
        this.snackBar.open('Réservation créée avec succès', 'Fermer', {
          duration: 3000
        });
        this.router.navigate(['/reservations', reservation.reservationId]);
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Erreur lors de la création de la réservation', error);
        this.snackBar.open('Erreur lors de la création de la réservation', 'Fermer', {
          duration: 3000
        });
      }
    });
  }
}
