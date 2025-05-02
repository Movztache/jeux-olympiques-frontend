import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // CommonModule inclut déjà les pipes
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
  payment: {  // Plus d'optionnel ici
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

  // Initialisation complète avec des valeurs par défaut
  ticketDetails: TicketDetails = {
    ticketId: '',
    eventDetails: {
      name: '',
      date: '',
      time: ''
    },
    amount: 0,
    date: '',
    payment: {
      transactionId: 'N/A',
      cardLastDigits: 'N/A',
      paymentMethod: 'N/A',
      status: 'N/A'
    }
  };

  qrCodeData = '';

  // Pour l'accès à window.print()
  window = window;

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      const stateData = navigation.extras.state as any;

      // Fusion des données reçues avec l'objet par défaut
      this.ticketDetails = {
        ...this.ticketDetails,
        ...stateData,
        // S'assurer que payment existe toujours
        payment: {
          ...this.ticketDetails.payment,
          ...(stateData.payment || {})
        }
      };

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

  formatMontant(montant: number): string {
    if (!montant) return '0,00 €';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant);
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleString('fr-FR');
  }


}
