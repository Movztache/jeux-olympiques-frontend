// src/app/features/reservations/reservation-detail/reservation-detail.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ReservationsService } from '../../../../core/services/reservation.service';
import { ReservationModel } from '../../../../core/models/reservation.model';
import { Observable, throwError } from 'rxjs';

@Component({
  selector: 'app-reservation-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatProgressBarModule
  ],
  templateUrl: './reservation-detail.component.html',
  styleUrls: ['./reservation-detail.component.scss']
})
export class ReservationDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reservationsService = inject(ReservationsService);
  private snackBar = inject(MatSnackBar);

  reservation: ReservationModel | null = null;
  isLoading = true;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadReservation(+id);
      } else {
        this.router.navigate(['/reservations/my-reservations']);
      }
    });
  }

  loadReservation(id: number): void {
    this.isLoading = true;
    this.reservationsService.getReservationById(id).subscribe({
      next: (data) => {
        this.reservation = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la réservation:', error);
        this.snackBar.open('Erreur lors du chargement de la réservation.', 'Fermer', {
          duration: 3000
        });
        this.isLoading = false;
        this.router.navigate(['/reservations/my-reservations']);
      }
    });
  }

  cancelReservation(): void {
    if (!this.reservation || this.reservation.reservationId === undefined) {
      this.snackBar.open('Identifiant de réservation non disponible.', 'Fermer', {
        duration: 3000
      });
      return;
    }

    // Vérifier si l'annulation est possible (selon vos règles métier)
    if (this.reservation.isUsed) {
      this.snackBar.open('Impossible d\'annuler une réservation déjà utilisée.', 'Fermer', {
        duration: 3000
      });
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir annuler cette réservation ? Cette action est irréversible.')) {
      this.reservationsService.cancelReservation(this.reservation.reservationId).subscribe({
        next: () => {
          this.snackBar.open('Réservation annulée avec succès.', 'Fermer', {
            duration: 3000
          });
          this.router.navigate(['/reservations/my-reservations']);
        },
        error: (error) => {
          console.error('Erreur lors de l\'annulation de la réservation:', error);
          this.snackBar.open('Erreur lors de l\'annulation de la réservation.', 'Fermer', {
            duration: 3000
          });
        }
      });
    }
  }

  downloadTicket(): void {
    if (!this.reservation || this.reservation.reservationId === undefined) return;

    this.reservationsService.downloadTicket(this.reservation.reservationId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `billet-${this.reservation?.reservationKey || 'reservation'}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      },
      error: (error) => {
        console.error('Erreur lors du téléchargement du billet:', error);
        this.snackBar.open('Erreur lors du téléchargement du billet.', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/reservations/my-reservations']);
  }
}
