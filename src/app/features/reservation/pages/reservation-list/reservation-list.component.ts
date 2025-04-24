import { Component, OnInit, Input, inject } from '@angular/core';
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
import { ReservationsService } from '../../../../core/services/reservation.service';
import { ReservationModel } from '../../../../core/models/reservation.model';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatProgressBar } from '@angular/material/progress-bar';

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

  // Ajout du mode d'affichage (admin ou utilisateur)
  @Input() viewMode: 'admin' | 'user' = 'admin';

  reservations: ReservationModel[] = [];
  filteredReservations: ReservationModel[] = [];
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
    // Adapter les colonnes selon le mode d'affichage
    if (this.viewMode === 'user') {
      // En mode utilisateur, on supprime la colonne 'user'
      this.displayedColumns = ['reservationId', 'reservationDate', 'status', 'quantity', 'offer', 'actions'];
    }

    this.loadReservations();
  }

  loadReservations(): void {
    this.isLoading = true;

    // Choisir la méthode du service selon le mode
    const reservationsObservable = this.viewMode === 'admin'
      ? this.reservationsService.getReservations()
      : this.reservationsService.getUserReservations();

    reservationsObservable.subscribe({
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
      filtered = filtered.filter(res => {
        // En mode utilisateur, on ne filtre pas sur le nom d'utilisateur
        if (this.viewMode === 'admin') {
          return (
            (res.userApp.firstName?.toLowerCase().includes(search)) ||
            (res.userApp.lastName?.toLowerCase().includes(search)) ||
            (res.reservationKey?.toLowerCase().includes(search)) ||
            (res.offer.name?.toLowerCase().includes(search))
          );
        } else {
          return (
            (res.reservationKey?.toLowerCase().includes(search)) ||
            (res.offer.name?.toLowerCase().includes(search))
          );
        }
      });
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
    // Implémentation existante...
  }

  getPaginatedData(): ReservationModel[] {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredReservations.slice(start, end);
  }

  // Ajouter une méthode pour télécharger le billet (à implémenter)
  downloadTicket(reservationId: number, event: Event): void {
    event.stopPropagation();
    this.reservationsService.downloadTicket(reservationId).subscribe({
      next: (data) => {
        // Code pour télécharger le fichier (PDF, image, etc.)
        console.log('Téléchargement du billet', data);
        // Exemple: utiliser une fonction pour télécharger le blob
        this.downloadFile(data, `ticket-${reservationId}.pdf`);
      },
      error: (error) => {
        console.error('Erreur lors du téléchargement du billet:', error);
      }
    });
  }

  private downloadFile(data: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
  }

  /**
   * Marque une réservation comme utilisée
   */
  markAsUsed(reservationId: number, event: Event): void {
    event.stopPropagation(); // Empêcher la navigation vers les détails

    if (confirm('Êtes-vous sûr de vouloir marquer cette réservation comme utilisée ?')) {
      this.isLoading = true;
      this.reservationsService.markAsUsed(reservationId).subscribe({
        next: () => {
          // Mettre à jour l'affichage sans recharger toutes les réservations
          const reservation = this.reservations.find(r => r.reservationId === reservationId);
          if (reservation) {
            reservation.isUsed = true;
            this.applyFilters(); // Réappliquer les filtres pour mettre à jour l'affichage
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erreur lors du marquage de la réservation comme utilisée:', error);
          this.isLoading = false;
        }
      });
    }
  }

  /**
   * Supprime une réservation
   */
  deleteReservation(reservationId: number, event: Event): void {
    event.stopPropagation(); // Empêcher la navigation vers les détails

    if (confirm('Êtes-vous sûr de vouloir supprimer cette réservation ? Cette action est irréversible.')) {
      this.isLoading = true;
      this.reservationsService.deleteReservation(reservationId).subscribe({
        next: () => {
          // Supprimer la réservation de la liste locale
          this.reservations = this.reservations.filter(r => r.reservationId !== reservationId);
          this.applyFilters(); // Réappliquer les filtres pour mettre à jour l'affichage
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erreur lors de la suppression de la réservation:', error);
          this.isLoading = false;
        }
      });
    }
  }
}
