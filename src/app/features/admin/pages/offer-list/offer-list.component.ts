import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort, SortDirection } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Observable, catchError, debounceTime, distinctUntilChanged, map, of, startWith, switchMap } from 'rxjs';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar.component';

import { OfferService } from '../../../../core/services/offer.service';
import { Offer, isOfferAvailable } from '../../../../core/models/offer.model';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { AuthService } from '../../../../core/authentication/auth.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-offer-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDialogModule,
    MatSortModule,
    MatPaginatorModule,
    MatTooltipModule,
    ReactiveFormsModule,
    ButtonComponent,
    SearchBarComponent
  ],
  templateUrl: './offer-list.component.html',
  styleUrls: ['./offer-list.component.scss']
})
export class OfferListComponent implements OnInit, AfterViewInit {
  offers$!: Observable<Offer[]>;
  offers: Offer[] = []; // Tableau standard pour stocker les offres
  sortedOffers: Offer[] = []; // Tableau trié pour l'affichage
  displayedOffers: Offer[] = []; // Données affichées après pagination
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Variables pour le tri
  currentSortColumn: string = '';
  currentSortDirection: SortDirection = '';

  // Variables pour la pagination
  pageSize = 10;
  pageSizeOptions = [10, 25, 50];
  currentPage = 0;
  totalOffers = 0;
  displayedColumns: string[] = ['name', 'price', 'offerType', 'personCount', 'available', 'actions'];
  loading = true;
  error: string | null = null;
  searchControl = new FormControl('');

  // Propriétés pour le débogage
  isAuthenticated = false;
  hasAdminRole = false;
  apiUrl = environment.apiUrl + '/offers';

  // Fonction utilitaire pour vérifier la disponibilité d'une offre
  isOfferAvailable = isOfferAvailable;

  constructor(
    private offerService: OfferService,
    private router: Router,
    private dialog: MatDialog,
    private authService: AuthService
  ) {
    // Vérifier si l'utilisateur est connecté et a le rôle Admin
    console.log('Vérification des droits d\'accès à la page admin');
    this.isAuthenticated = this.authService.isLoggedIn();
    this.hasAdminRole = this.authService.hasRole('Admin');
    console.log('Authentifié:', this.isAuthenticated);
    console.log('Rôle Admin:', this.hasAdminRole);
  }

  ngOnInit(): void {
    // Ajouter un identifiant unique à la fenêtre pour vérifier si la page se recharge
    const pageId = Date.now().toString();
    (window as any).pageLoadId = pageId;

    // Charger les offres immédiatement au démarrage
    this.loadInitialOffers();

    // Initialize the search with debounce
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.filterOffers(searchTerm || '');
    });
  }

  ngAfterViewInit(): void {
    // Initialiser le tableau trié
    this.sortedOffers = [...this.offers];

    // Initialiser les données affichées avec la pagination
    this.updateDisplayedOffers();

    // Définir explicitement la taille de page
    if (this.paginator) {
      this.paginator._intl.itemsPerPageLabel = 'Offres par page';
      this.paginator.pageSize = this.pageSize;
    }

    // console.log('Vue initialisée, nombre d\'offres:', this.offers.length);
  }

  // Méthode pour mettre à jour les données affichées en fonction de la pagination
  updateDisplayedOffers(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedOffers = this.sortedOffers.slice(startIndex, endIndex);
    // console.log(`Affichage des offres ${startIndex + 1} à ${Math.min(endIndex, this.sortedOffers.length)} sur ${this.sortedOffers.length}`);
  }

  // Méthode pour trier les données manuellement
  sortData(sort: Sort): void {
    this.currentSortColumn = sort.active;
    this.currentSortDirection = sort.direction as SortDirection;

    // console.log('Tri demandé:', this.currentSortColumn, this.currentSortDirection);

    if (!this.currentSortColumn || this.currentSortDirection === '') {
      // Si aucun tri n'est actif, utiliser les données non triées
      this.sortedOffers = [...this.offers];
      this.updateDisplayedOffers();
      return;
    }

    // Trier les données manuellement
    this.sortedOffers = [...this.offers].sort((a, b) => {
      const isAsc = this.currentSortDirection === 'asc';
      switch (this.currentSortColumn) {
        case 'name': return this.compare(a.name.toLowerCase(), b.name.toLowerCase(), isAsc);
        case 'price': return this.compare(a.price, b.price, isAsc);
        case 'offerType': return this.compare(a.offerType, b.offerType, isAsc);
        case 'available': return this.compare(isOfferAvailable(a) ? 1 : 0, isOfferAvailable(b) ? 1 : 0, isAsc);
        default: return 0;
      }
    });

    // Réinitialiser la pagination à la première page si nécessaire
    if (this.paginator && this.paginator.pageIndex !== 0) {
      this.paginator.firstPage();
      this.currentPage = 0;
    }

    // Mettre à jour les données affichées
    this.updateDisplayedOffers();

    // console.log('Données triées:', this.sortedOffers.length);
  }

  // Fonction de comparaison pour le tri
  private compare(a: number | string, b: number | string, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  loadInitialOffers(): void {
    // console.log('Chargement initial des offres...');
    this.loading = true;
    this.error = null;

    this.offerService.getAllOffers().subscribe({
      next: (data) => {
        // console.log('Offres reçues dans loadInitialOffers:', data);
        this.offers = data;
        this.sortedOffers = [...data]; // Mettre à jour les données du tableau

        // Réinitialiser la pagination
        this.currentPage = 0;
        if (this.paginator) {
          this.paginator.pageIndex = 0;
          this.paginator.pageSize = this.pageSize;
        }

        // Mettre à jour les données affichées
        this.updateDisplayedOffers();

        this.loading = false;
      },
      error: (err) => {
        // console.error('Erreur lors du chargement initial des offres:', err);
        this.error = "Impossible de charger les offres. Veuillez réessayer.";
        this.loading = false;
      }
    });
  }

  /**
   * Applique le filtre de recherche (pour la compatibilité avec le nouveau design de la barre de recherche)
   */
  applyFilter(): void {
    this.filterOffers(this.searchControl.value || '');
  }

  filterOffers(searchTerm: string): void {
    this.loading = true;

    if (!searchTerm) {
      // Si aucun terme de recherche, afficher toutes les offres
      this.sortedOffers = [...this.offers];
      this.currentPage = 0;
      if (this.paginator) {
        this.paginator.pageIndex = 0;
      }
      this.updateDisplayedOffers();
      this.loading = false;
      return;
    }

    // Filtrer les offres déjà chargées
    const filteredOffers = this.offers.filter(offer =>
      offer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.offerType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // console.log('Offres filtrées:', filteredOffers);

    // Mettre à jour les offres filtrées
    this.sortedOffers = filteredOffers;

    // Réinitialiser la pagination
    this.currentPage = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }

    // Mettre à jour les données affichées
    this.updateDisplayedOffers();

    this.loading = false;
  }

  loadOffers(searchTerm: string): Observable<Offer[]> {
    this.loading = true;
    return this.offerService.getAllOffers().pipe(
      map(offers => {
        if (searchTerm) {
          const filteredOffers = offers.filter(offer =>
            offer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            offer.offerType.toLowerCase().includes(searchTerm.toLowerCase())
          );
          return filteredOffers;
        }
        return offers;
      }),
      catchError(err => {
        this.error = "Impossible de charger les offres. Veuillez réessayer.";
        return of([]);
      }),
      map(offers => {
        this.loading = false;
        console.log('Chargement terminé, nombre d\'offres:', offers.length);
        return offers;
      })
    );
  }

  createOffer(): void {
    this.router.navigate(['/admin/offers/create']);
  }

  editOffer(offer: Offer): void {
    this.router.navigate(['/admin/offers/edit', offer.offerId]);
  }

  viewOffer(offer: Offer): void {
    this.router.navigate(['/admin/offers', offer.offerId]);
  }

  toggleOfferAvailability(offer: Offer, event: MouseEvent): void {
    // Vérifier si la page a été rechargée
    console.log('Page ID actuel:', (window as any).pageLoadId);

    // Empêcher la propagation de l'événement pour éviter le rechargement de la page
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const currentAvailability = isOfferAvailable(offer);
    const newAvailability = !currentAvailability;
    const action = newAvailability ? 'activer' : 'désactiver';

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        title: `Confirmer le changement de disponibilité`,
        message: `Êtes-vous sûr de vouloir ${action} l'offre "${offer.name}" ?`,
        confirmText: 'Confirmer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.offerService.updateOfferAvailability(offer.offerId, newAvailability).subscribe({
          next: (updatedOffer) => {
            // Mettre à jour l'offre dans le tableau sans recharger toutes les offres
            const index = this.offers.findIndex(o => o.offerId === offer.offerId);
            if (index !== -1) {
              // Mettre à jour l'offre avec les nouvelles données
              this.offers[index] = {
                ...this.offers[index],
                available: newAvailability,
                isAvailable: newAvailability
              };

              // Mettre à jour le tableau d'offres
              this.offers = [...this.offers];

              // Réappliquer le tri si nécessaire
              if (this.currentSortColumn && this.currentSortDirection) {
                this.sortData({ active: this.currentSortColumn, direction: this.currentSortDirection as SortDirection });
              } else {
                this.sortedOffers = [...this.offers];
                this.updateDisplayedOffers();
              }

              // console.log('Offre mise à jour, tri actuel:', this.currentSortColumn, this.currentSortDirection);

              // console.log('Offre mise à jour localement:', this.offers[index]);
            }
            this.loading = false;
          },
          error: (err) => {
            this.error = `Erreur lors de la mise à jour de la disponibilité de l'offre.`;
            // console.error(err);
            this.loading = false;
          }
        });
      }
    });
  }

  deleteOffer(offer: Offer, event: MouseEvent): void {
    // Vérifier si la page a été rechargée
    // console.log('Page ID actuel:', (window as any).pageLoadId);

    // Empêcher la propagation de l'événement pour éviter le rechargement de la page
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        title: 'Confirmer la suppression',
        message: `Êtes-vous sûr de vouloir supprimer l'offre "${offer.name}" ?`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.offerService.deleteOffer(offer.offerId).subscribe({
          next: () => {
            // Supprimer l'offre du tableau sans recharger toutes les offres
            const index = this.offers.findIndex(o => o.offerId === offer.offerId);
            if (index !== -1) {
              // Supprimer l'offre du tableau
              this.offers.splice(index, 1);

              // Mettre à jour le tableau d'offres
              this.offers = [...this.offers];

              // Réappliquer le tri si nécessaire
              if (this.currentSortColumn && this.currentSortDirection) {
                this.sortData({ active: this.currentSortColumn, direction: this.currentSortDirection as SortDirection });
              } else {
                this.sortedOffers = [...this.offers];
                this.updateDisplayedOffers();
              }

              // console.log('Offre supprimée, tri actuel:', this.currentSortColumn, this.currentSortDirection);

              // console.log('Offre supprimée localement, nombre d\'offres restantes:', this.offers.length);
            }
            this.loading = false;
          },
          error: (err) => {
            this.error = "Erreur lors de la suppression de l'offre.";
            // console.error(err);
            this.loading = false;
          }
        });
      }
    });
  }

  refreshOffers(): void {
    // Vider la barre de recherche
    this.searchControl.setValue('', { emitEvent: false });

    this.error = null;
    this.loadInitialOffers();
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    // console.log(`Page changée: page ${this.currentPage}, taille ${this.pageSize}`);

    // Mettre à jour les données affichées
    this.updateDisplayedOffers();
  }

  testApiCall(): void {
    // console.log('Test d\'appel API...');
    this.loading = true;
    this.error = null;

    // Appel direct à l'API pour tester
    this.offerService.getAllOffers().subscribe({
      next: (offers) => {
        // console.log('Réponse de l\'API:', offers);
        this.loading = false;
        if (offers && offers.length > 0) {
          this.error = `API OK: ${offers.length} offres reçues`;
          this.offers = offers; // Mettre à jour le tableau d'offres
        } else {
          this.error = 'API OK mais aucune offre reçue';
        }
      },
      error: (err) => {
        // console.error('Erreur API:', err);
        this.loading = false;
        this.error = `Erreur API: ${err.status} ${err.statusText}`;
      }
    });
  }
}
