import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReservationsService } from '../../../../core/services/reservation';
import { Reservation } from '../../../../core/models/reservation';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import {MatProgressBar} from '@angular/material/progress-bar';

@Component({
  selector: 'app-reservation-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatInputModule,
    MatFormFieldModule,
    MatMenuModule,
    MatTooltipModule,
    MatButtonToggle,
    MatButtonToggle,
    MatProgressBar,
    MatButtonToggleGroup
  ],
  templateUrl: './reservation-list.component.html',
  styleUrls: ['./reservation-list.component.scss']
})
export class ReservationListComponent implements OnInit {
  private reservationsService = inject(ReservationsService);

  reservations: Reservation[] = [];
  filteredReservations: Reservation[] = [];
  displayedColumns: string[] = ['reservationId', 'reservationDate', 'status', 'quantity', 'user', 'offer', 'actions'];

  // Pagination
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;

  // Filtrage
  searchText = '';
  statusFilter: 'all' | 'active' | 'used' = 'all';

  isLoading = true;

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.isLoading = true;
    this.reservationsService.getReservations().subscribe({
      next: (data) => {
        this.reservations = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des réservations:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.reservations];

    // Filtre par statut
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(res =>
        this.statusFilter === 'used' ? res.isUsed : !res.isUsed
      );
    }

    // Filtre par texte de recherche
    if (this.searchText.trim()) {
      const search = this.searchText.toLowerCase().trim();
      filtered = filtered.filter(res =>
        (res.userApp.firstName?.toLowerCase().includes(search)) ||
        (res.userApp.lastName?.toLowerCase().includes(search)) ||
        (res.reservationKey?.toLowerCase().includes(search)) ||
        (res.offer.name?.toLowerCase().includes(search))
      );
    }

    this.filteredReservations = filtered;
    this.totalItems = this.filteredReservations.length;

    // Réinitialiser la pagination si nécessaire
    if (this.pageIndex * this.pageSize >= this.totalItems) {
      this.pageIndex = 0;
    }
  }

  onSearchChange(): void {
    this.pageIndex = 0;
    this.applyFilters();
  }

  onStatusFilterChange(status: 'all' | 'active' | 'used'): void {
    this.statusFilter = status;
    this.pageIndex = 0;
    this.applyFilters();
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
  }

  onSort(sort: Sort): void {
    const data = [...this.filteredReservations];
    if (!sort.active || sort.direction === '') {
      this.filteredReservations = data;
      return;
    }

    this.filteredReservations = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'reservationId': return compare(a.reservationId, b.reservationId, isAsc);
        case 'reservationDate': return compare(new Date(a.reservationDate).getTime(), new Date(b.reservationDate).getTime(), isAsc);
        case 'status': return compare(a.isUsed, b.isUsed, isAsc);
        case 'quantity': return compare(a.quantity, b.quantity, isAsc);
        case 'user': return compare(a.userApp.lastName, b.userApp.lastName, isAsc);
        case 'offer': return compare(a.offer.name, b.offer.name, isAsc);
        default: return 0;
      }
    });
  }

  deleteReservation(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
      this.reservationsService.deleteReservation(id).subscribe({
        next: () => {
          this.loadReservations();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
        }
      });
    }
  }

  markAsUsed(id: number): void {
    this.reservationsService.useReservation(id).subscribe({
      next: () => {
        this.loadReservations();
      },
      error: (error) => {
        console.error('Erreur lors du marquage comme utilisée:', error);
      }
    });
  }

  getPaginatedData(): Reservation[] {
    const startIndex = this.pageIndex * this.pageSize;
    return this.filteredReservations.slice(startIndex, startIndex + this.pageSize);
  }
}

function compare(a: any, b: any, isAsc: boolean): number {
  if (a === null || a === undefined) return isAsc ? -1 : 1;
  if (b === null || b === undefined) return isAsc ? 1 : -1;
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
