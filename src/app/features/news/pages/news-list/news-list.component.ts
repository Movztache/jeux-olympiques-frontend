import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';

import { News, NewsPageResponse, NewsSearchParams } from '../../../../core/models/news.model';
import { NewsService } from '../../../../core/services/news.service';
import { NewsCardComponent } from '../../components/news-card/news-card.component';

/**
 * Composant pour afficher la liste des actualités publiques
 */
@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatTooltipModule,
    NewsCardComponent
  ],
  templateUrl: './news-list.component.html',
  styleUrls: ['./news-list.component.scss']
})
export class NewsListComponent implements OnInit, OnDestroy {
  news: News[] = [];
  loading = false;
  error: string | null = null;
  
  // Pagination
  totalElements = 0;
  pageSize = 9;
  currentPage = 0;
  pageSizeOptions = [6, 9, 12, 18];

  // Recherche
  searchControl = new FormControl('');
  
  private destroy$ = new Subject<void>();

  constructor(private newsService: NewsService) {}

  ngOnInit(): void {
    this.loadNews();
    this.setupSearch();
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
    ).subscribe(searchTerm => {
      this.currentPage = 0;
      if (searchTerm && searchTerm.trim()) {
        this.searchNews(searchTerm.trim());
      } else {
        this.loadNews();
      }
    });
  }

  /**
   * Charge les actualités publiées
   */
  loadNews(): void {
    this.loading = true;
    this.error = null;

    const params: NewsSearchParams = {
      page: this.currentPage,
      size: this.pageSize
    };

    this.newsService.getPublishedNews(params).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: NewsPageResponse) => {
        this.news = response.content;
        this.totalElements = response.totalElements;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des actualités:', error);
        this.error = 'Erreur lors du chargement des actualités. Veuillez réessayer.';
        this.loading = false;
      }
    });
  }

  /**
   * Recherche des actualités par titre
   */
  searchNews(searchTerm: string): void {
    this.loading = true;
    this.error = null;

    this.newsService.searchByTitle(searchTerm).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (results: News[]) => {
        // Filtrer uniquement les actualités publiées
        this.news = results.filter(news => news.published);
        this.totalElements = this.news.length;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors de la recherche:', error);
        this.error = 'Erreur lors de la recherche. Veuillez réessayer.';
        this.loading = false;
      }
    });
  }

  /**
   * Gère le changement de page
   */
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    
    const searchTerm = this.searchControl.value;
    if (searchTerm && searchTerm.trim()) {
      this.searchNews(searchTerm.trim());
    } else {
      this.loadNews();
    }
  }

  /**
   * Efface la recherche
   */
  clearSearch(): void {
    this.searchControl.setValue('');
    this.currentPage = 0;
    this.loadNews();
  }

  /**
   * Recharge les actualités
   */
  refresh(): void {
    this.currentPage = 0;
    this.searchControl.setValue('');
    this.loadNews();
  }

  /**
   * Vérifie s'il y a des actualités à afficher
   */
  hasNews(): boolean {
    return this.news && this.news.length > 0;
  }

  /**
   * Vérifie si une recherche est active
   */
  isSearchActive(): boolean {
    const searchTerm = this.searchControl.value;
    return !!(searchTerm && searchTerm.trim());
  }

  /**
   * Fonction de tracking pour ngFor
   */
  trackByNewsId(index: number, news: News): number {
    return news.id || index;
  }
}
