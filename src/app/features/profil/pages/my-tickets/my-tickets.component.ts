import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { QRCodeComponent } from 'angularx-qrcode';

interface Ticket {
  id: string;
  eventName: string;
  eventDate: Date;
  eventLocation: string;
  seatInfo: string;
  offerType: string;
  price: number;
  qrCode: string;
  isUsed: boolean;
}

@Component({
  selector: 'app-my-tickets',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule,
    QRCodeComponent
  ],
  templateUrl: './my-tickets.component.html',
  styleUrl: './my-tickets.component.scss'
})
export class MyTicketsComponent implements OnInit {
  tickets: Ticket[] = [];
  upcomingTickets: Ticket[] = [];
  pastTickets: Ticket[] = [];
  loading = true;
  error = false;
  selectedTicket: Ticket | null = null;
  showQRCode = false;

  constructor() {}

  ngOnInit(): void {
    // Simuler le chargement des données
    setTimeout(() => {
      this.loadTickets();
    }, 1000);
  }

  loadTickets(): void {
    // Données fictives pour la démonstration
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const lastMonth = new Date(now);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    this.tickets = [
      {
        id: 'T12345',
        eventName: 'Natation - Finale 100m',
        eventDate: tomorrow,
        eventLocation: 'Paris La Défense Arena',
        seatInfo: 'Section A, Rangée 5, Siège 12',
        offerType: 'DUO',
        price: 45,
        qrCode: 'T12345-ABCDEF',
        isUsed: false
      },
      {
        id: 'T12346',
        eventName: 'Athlétisme - 100m Hommes',
        eventDate: nextWeek,
        eventLocation: 'Stade de France',
        seatInfo: 'Tribune Est, Rangée 10, Siège 25',
        offerType: 'SOLO',
        price: 30,
        qrCode: 'T12346-GHIJKL',
        isUsed: false
      },
      {
        id: 'T12347',
        eventName: 'Gymnastique - Finale',
        eventDate: lastMonth,
        eventLocation: 'Bercy Arena',
        seatInfo: 'Section C, Rangée 3, Siège 8',
        offerType: 'SOLO',
        price: 55,
        qrCode: 'T12347-MNOPQR',
        isUsed: true
      }
    ];

    // Séparer les billets à venir et passés
    this.upcomingTickets = this.tickets.filter(ticket =>
      new Date(ticket.eventDate) > now && !ticket.isUsed
    );

    this.pastTickets = this.tickets.filter(ticket =>
      new Date(ticket.eventDate) <= now || ticket.isUsed
    );

    this.loading = false;
  }

  selectTicket(ticket: Ticket): void {
    this.selectedTicket = ticket;
    this.showQRCode = false;
  }

  toggleQRCode(): void {
    this.showQRCode = !this.showQRCode;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
