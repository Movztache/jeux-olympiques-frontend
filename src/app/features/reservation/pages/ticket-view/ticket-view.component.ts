import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservationsService } from '../../../../core/services/reservation.service';
import { ReservationModel } from '../../../../core/models/reservation.model';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { CurrencyPipe, DatePipe, NgIf } from '@angular/common';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-ticket-view',
  templateUrl: './ticket-view.component.html',
  standalone: true,
  imports: [
    MatCardModule,
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatChipsModule,
    CurrencyPipe,
    DatePipe,
    NgIf,
    QRCodeComponent
  ],
  styleUrls: ['./ticket-view.component.scss']
})
export class TicketViewComponent implements OnInit {
  reservation: ReservationModel | null = null;
  isLoading = true;
  reservationId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reservationService: ReservationsService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.reservationId = +id;
        this.loadReservation(this.reservationId);
      } else {
        this.router.navigate(['/reservations']);
      }
    });
  }

  loadReservation(id: number): void {
    this.isLoading = true;
    this.reservationService.getReservationById(id).subscribe({
      next: (reservation: any) => {
        this.reservation = reservation;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement de la réservation', error);
        this.isLoading = false;
        this.router.navigate(['/reservations']);
      }
    });
  }

  // Nouvelle méthode pour générer les données du QR code
  getQrCodeData(): string {
    if (!this.reservation) return '';

    // Créer un objet contenant les informations essentielles du billet
    const ticketData = {
      id: this.reservation.reservationId,
      key: this.reservation.reservationKey,
      offer: this.reservation.offer?.name,
      qty: this.reservation.quantity,
      date: this.reservation.reservationDate
    };

    // Convertir en JSON pour inclusion dans le QR code
    return JSON.stringify(ticketData);
  }

  print(): void {
    window.print();
  }

  goBack(): void {
    this.router.navigate(['/reservations', this.reservationId]);
  }
}
