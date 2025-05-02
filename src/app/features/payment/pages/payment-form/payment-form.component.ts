// src/app/features/payment/payment-form/payment-form.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss']
})
export class PaymentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private reservationId: number | null = null;

  paymentForm!: FormGroup;
  isProcessing = false;

  // Normalement, ces données viendraient du state de l'application
  orderTotal = 100; // Prix fictif en euros
  eventDetails = { name: 'Concert Example', date: '2024-12-31', time: '20:00' };

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();

    if (navigation?.extras.state) {
      const state = navigation.extras.state as any;
      this.orderTotal = state.orderTotal || 100;
      this.eventDetails = state.eventDetails || {
        name: 'Concert Example',
        date: '2024-12-31',
        time: '20:00'
      };
      this.reservationId = state.reservationId;
    }

    this.paymentForm = this.fb.group({
      cardHolderName: ['', [Validators.required]],
      cardNumber: ['', [Validators.required, Validators.pattern('[0-9]{16}')]],
      expiryDate: ['', [Validators.required, Validators.pattern('(0[1-9]|1[0-2])\\/[0-9]{2}')]],
      cvv: ['', [Validators.required, Validators.pattern('[0-9]{3,4}')]]
    });
  }

  onSubmit(): void {
    if (this.paymentForm.valid) {
      this.isProcessing = true;

      // Simuler un délai de traitement du paiement
      setTimeout(() => {
        this.isProcessing = false;

        // Simuler un paiement réussi et rediriger vers la confirmation
        this.router.navigate(['/payment/confirmation'], {
          state: {
            ticketId: 'TKT-' + Math.floor(Math.random() * 10000000),
            reservationId: this.reservationId,
            eventDetails: this.eventDetails,
            amount: this.orderTotal,
            date: new Date().toISOString(),
            payment: {
              transactionId: 'TXN-' + Math.floor(Math.random() * 10000000),
              cardLastDigits: this.paymentForm.value.cardNumber.slice(-4),
              paymentMethod: 'Carte de crédit',
              status: 'Paiement accepté'
            }
          }
        });
      }, 2000);
    } else {
      this.snackBar.open('Veuillez corriger les erreurs dans le formulaire', 'Fermer', {
        duration: 3000
      });
    }
  }
}
