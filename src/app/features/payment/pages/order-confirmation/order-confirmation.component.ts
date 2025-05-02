// src/app/features/payment/order-confirmation/order-confirmation.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { QRCodeComponent } from 'angularx-qrcode';

interface TicketDetails {
  ticketId: string;
  eventDetails: {
    name: string;
    date: string;
    time: string;
  };
  amount: number;
  date: string;
  payment?: { // Rendez payment optionnel avec '?'
    transactionId: string;
    cardLastDigits: string;
    paymentMethod: string;
    status: string;
  }
}

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    QRCodeComponent
  ],
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.scss']
})
export class OrderConfirmationComponent implements OnInit {
  private router = inject(Router);

  ticketDetails: TicketDetails | null = null;
  qrCodeData = '';

  // Pour l'accès à window.print()
  window = window;

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.ticketDetails = navigation.extras.state as TicketDetails;

      // Si payment n'existe pas, créez un objet par défaut
      if (!this.ticketDetails.payment) {
        this.ticketDetails.payment = {
          transactionId: 'N/A',
          cardLastDigits: 'N/A',
          paymentMethod: 'N/A',
          status: 'N/A'
        };
      }

      // Générer les données pour le QR code
      this.qrCodeData = JSON.stringify({
        ticketId: this.ticketDetails.ticketId,
        event: this.ticketDetails.eventDetails.name,
        date: this.ticketDetails.eventDetails.date,
        time: this.ticketDetails.eventDetails.time,
        issuedAt: this.ticketDetails.date,
        transactionId: this.ticketDetails.payment.transactionId
      });
    } else {
      // Si aucune donnée n'est disponible, rediriger vers la page principale
      this.router.navigate(['/offers']);
    }
  }
}
