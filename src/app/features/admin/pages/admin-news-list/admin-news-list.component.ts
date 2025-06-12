import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { News, NewsSearchParams } from '../../../../core/models/news.model';
import { NewsService } from '../../../../core/services/news.service';
import { AuthService } from '../../../../core/authentication/auth.service';

/**
 * Composant d'administration pour la gestion des actualités
 */
@Component({
  selector: 'app-admin-news-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatMenuModule
  ],
  templateUrl: './admin-news-list.component.html',
  styleUrls: ['./admin-news-list.component.scss']
})
export class AdminNewsListComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['title', 'author', 'createdDate', 'published', 'actions'];
  dataSource = new MatTableDataSource<News>();
  
  loading = false;
  error: string | null = null;
  
  // Contrôles de recherche et filtres
  searchControl = new FormControl('');
  statusFilter = new FormControl('all');
  
  // Pagination
  totalElements = 0;
  pageSize = 10;
  currentPage = 0;
  pageSizeOptions = [10, 25, 50];
  
  // Options de filtre
  statusOptions = [
    { value: 'all', label: 'Tous' },
    { value: 'published', label: 'Publiés' },
    { value: 'draft', label: 'Brouillons' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private newsService: NewsService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.setupSearch();
    this.setupFilters();
    this.loadNews();
    this.subscribeToNewsUpdates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Configure la recherche avec debounce
   */
  private setupSearch(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 0;
      this.loadNews();
    });
  }

  /**
   * Configure les filtres
   */
  private setupFilters(): void {
    this.statusFilter.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 0;
      this.loadNews();
    });
  }

  /**
   * S'abonne aux mises à jour des actualités
   */
  private subscribeToNewsUpdates(): void {
    this.newsService.newsUpdated$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(updated => {
      if (updated) {
        this.loadNews();
      }
    });
  }

  /**
   * Charge les actualités avec les filtres appliqués
   */
  loadNews(): void {
    this.loading = true;
    this.error = null;

    const params: NewsSearchParams = {
      page: this.currentPage,
      size: this.pageSize,
      sortBy: 'createdDate',
      sortDir: 'desc'
    };

    const searchTerm = this.searchControl.value;
    if (searchTerm && searchTerm.trim()) {
      // Recherche par titre
      this.newsService.searchByTitle(searchTerm.trim()).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (results: News[]) => {
          let filteredResults = this.applyStatusFilter(results);
          this.dataSource.data = filteredResults;
          this.totalElements = filteredResults.length;
          this.loading = false;
        },
        error: (error) => this.handleError('Erreur lors de la recherche', error)
      });
    } else {
      // Chargement normal avec pagination
      this.newsService.getAllNews(params).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (response) => {
          let filteredResults = this.applyStatusFilter(response.content);
          this.dataSource.data = filteredResults;
          this.totalElements = response.totalElements;
          this.loading = false;
        },
        error: (error) => this.handleError('Erreur lors du chargement des actualités', error)
      });
    }
  }

  /**
   * Applique le filtre de statut
   */
  private applyStatusFilter(news: News[]): News[] {
    const status = this.statusFilter.value;
    if (status === 'published') {
      return news.filter(n => n.published);
    } else if (status === 'draft') {
      return news.filter(n => !n.published);
    }
    return news;
  }

  /**
   * Gère le changement de page
   */
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadNews();
  }

  /**
   * Navigue vers la création d'une nouvelle actualité
   */
  createNews(): void {
    this.router.navigate(['/admin/news/create']);
  }

  /**
   * Navigue vers l'édition d'une actualité
   */
  editNews(news: News): void {
    this.router.navigate(['/admin/news/edit', news.id]);
  }

  /**
   * Affiche le détail d'une actualité
   */
  viewNews(news: News): void {
    window.open(`/actualites/${news.id}`, '_blank');
  }

  /**
   * Bascule le statut de publication
   */
  togglePublishStatus(news: News): void {
    const newStatus = !news.published;
    const action = newStatus ? 'publier' : 'dépublier';
    
    if (confirm(`Êtes-vous sûr de vouloir ${action} cette actualité ?`)) {
      const updatedNews = { ...news, published: newStatus };
      
      this.newsService.updateNews(news.id!, {
        title: updatedNews.title,
        description: updatedNews.description,
        published: updatedNews.published,
        imageUrl: updatedNews.imageUrl
      }).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.showSuccess(`Actualité ${newStatus ? 'publiée' : 'dépubliée'} avec succès`);
          this.loadNews();
        },
        error: (error) => this.handleError(`Erreur lors de la ${action}ication`, error)
      });
    }
  }

  /**
   * Supprime une actualité
   */
  deleteNews(news: News): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'actualité "${news.title}" ? Cette action est irréversible.`)) {
      this.newsService.deleteNews(news.id!).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.showSuccess('Actualité supprimée avec succès');
          this.loadNews();
        },
        error: (error) => this.handleError('Erreur lors de la suppression', error)
      });
    }
  }

  /**
   * Efface les filtres
   */
  clearFilters(): void {
    this.searchControl.setValue('');
    this.statusFilter.setValue('all');
    this.currentPage = 0;
    this.loadNews();
  }

  /**
   * Actualise la liste
   */
  refresh(): void {
    this.loadNews();
  }

  /**
   * Retourne le nom de l'auteur
   */
  getAuthorName(news: News): string {
    return this.newsService.getAuthorName(news);
  }

  /**
   * Formate une date
   */
  formatDate(dateString: string): string {
    return this.newsService.formatDate(dateString);
  }

  /**
   * Affiche un message de succès
   */
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  /**
   * Gère les erreurs
   */
  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.error = message;
    this.loading = false;
    
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }
}
