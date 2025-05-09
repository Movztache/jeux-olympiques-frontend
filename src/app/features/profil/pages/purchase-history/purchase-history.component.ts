import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

interface Purchase {
  id: number;
  date: Date;
  totalAmount: number;
  status: string;
  items: PurchaseItem[];
}

interface PurchaseItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  offerType: string;
}

@Component({
  selector: 'app-purchase-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './purchase-history.component.html',
  styleUrl: './purchase-history.component.scss'
})
export class PurchaseHistoryComponent implements OnInit {
  purchases: Purchase[] = [];
  loading = true;
  error = false;
  displayedColumns: string[] = ['date', 'totalAmount', 'status', 'actions'];
  expandedPurchase: Purchase | null = null;

  constructor() {}

  ngOnInit(): void {
    // Simuler le chargement des données
    setTimeout(() => {
      this.loadPurchases();
    }, 1000);
  }

  loadPurchases(): void {
    // Données fictives pour la démonstration
    this.purchases = [
      {
        id: 1,
        date: new Date('2023-12-15'),
        totalAmount: 120,
        status: 'Complétée',
        items: [
          { id: 101, name: 'Billet Natation', quantity: 2, price: 45, offerType: 'DUO' },
          { id: 102, name: 'Billet Athlétisme', quantity: 1, price: 30, offerType: 'SOLO' }
        ]
      },
      {
        id: 2,
        date: new Date('2023-11-20'),
        totalAmount: 85,
        status: 'Complétée',
        items: [
          { id: 103, name: 'Billet Gymnastique', quantity: 1, price: 55, offerType: 'SOLO' },
          { id: 104, name: 'Billet Escrime', quantity: 1, price: 30, offerType: 'SOLO' }
        ]
      },
      {
        id: 3,
        date: new Date('2023-10-05'),
        totalAmount: 150,
        status: 'Complétée',
        items: [
          { id: 105, name: 'Billet Cérémonie d\'ouverture', quantity: 1, price: 150, offerType: 'SOLO' }
        ]
      }
    ];

    this.loading = false;
  }

  toggleExpand(purchase: Purchase): void {
    this.expandedPurchase = this.expandedPurchase === purchase ? null : purchase;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Complétée': return 'green';
      case 'En cours': return 'blue';
      case 'Annulée': return 'red';
      default: return 'gray';
    }
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}
