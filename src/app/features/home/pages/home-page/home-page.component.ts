import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../../core/authentication/auth.service';
import { NewsService } from '../../../../core/services/news.service';
import { News, NewsSearchParams } from '../../../../core/models/news.model';

import { TicketCarouselComponent } from '../../../../shared/components/ticket-carousel/ticket-carousel.component';
import { NewsCardComponent } from '../../../news/components/news-card/news-card.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  standalone: true,
  imports: [
    CommonModule,
    TicketCarouselComponent,
    NewsCardComponent,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit, OnDestroy {
  isUserLoggedIn = false;
  bannerPath = '../../../../../assets/pictures/banner.png';

  // Actualités
  latestNews: News[] = [];
  newsLoading = false;
  newsError: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private newsService: NewsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Vérification si l'utilisateur est connecté
    this.isUserLoggedIn = this.authService.isLoggedIn();

    // Option: s'abonner aux changements d'état de connexion
    this.authService.currentUser.subscribe(user => {
      this.isUserLoggedIn = !!user;
    });

    // Charger les dernières actualités
    this.loadLatestNews();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charge les 3 dernières actualités publiées
   */
  loadLatestNews(): void {
    this.newsLoading = true;
    this.newsError = null;

    const params: NewsSearchParams = {
      page: 0,
      size: 3,
      sortBy: 'createdDate',
      sortDir: 'desc'
    };

    this.newsService.getPublishedNews(params).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.latestNews = response.content;
        this.newsLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des actualités:', error);
        this.newsError = 'Impossible de charger les actualités';
        this.newsLoading = false;
      }
    });
  }

  /**
   * Navigue vers la page des actualités
   */
  viewAllNews(): void {
    this.router.navigate(['/actualites']);
  }

  /**
   * Vérifie s'il y a des actualités à afficher
   */
  hasNews(): boolean {
    return this.latestNews && this.latestNews.length > 0;
  }

  /**
   * Fonction de tracking pour ngFor
   */
  trackByNewsId(index: number, news: News): number {
    return news.id || index;
  }
}
