import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { Observable, switchMap } from 'rxjs';
import { Reservation } from '../../../../core/models/reservation';
import { ReservationsService } from '../../../../core/services/reservation';

@Component({
  selector: 'app-reservation-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule
  ],
  templateUrl: './reservation-detail.component.html',
  styleUrls: ['./reservation-detail.component.scss']
})
export class ReservationDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reservationsService = inject(ReservationsService);

  reservation$!: Observable<Reservation>;

  ngOnInit(): void {
    this.reservation$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id'));
        return this.reservationsService.getReservationById(id);
      })
    );
  }

  useReservation(reservationId: number): void {
    this.reservationsService.useReservation(reservationId).subscribe({
      next: () => {
        // Rafraîchir les données
        this.reservation$ = this.reservationsService.getReservationById(reservationId);
      },
      error: (err) => console.error('Erreur lors de l\'utilisation de la réservation', err)
    });
  }

  deleteReservation(reservationId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
      this.reservationsService.deleteReservation(reservationId).subscribe({
        next: () => {
          this.router.navigate(['/reservations']);
        },
        error: (err) => console.error('Erreur lors de la suppression de la réservation', err)
      });
    }
  }
}
