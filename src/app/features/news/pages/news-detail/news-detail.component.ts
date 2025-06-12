import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

import { News } from '../../../../core/models/news.model';
import { NewsService } from '../../../../core/services/news.service';

/**
 * Composant pour afficher le détail d'une actualité
 */
@Component({
  selector: 'app-news-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './news-detail.component.html',
  styleUrls: ['./news-detail.component.scss']
})
export class NewsDetailComponent implements OnInit, OnDestroy {
  news: News | null = null;
  loading = false;
  error: string | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public newsService: NewsService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadNews(id);
      } else {
        this.router.navigate(['/actualites']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charge les détails de l'actualité
   */
  loadNews(id: number): void {
    this.loading = true;
    this.error = null;

    this.newsService.getNewsById(id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (news: News) => {
        // Vérifier si l'actualité est publiée (sauf pour les admins)
        if (!news.published) {
          this.error = 'Cette actualité n\'est pas disponible.';
          this.loading = false;
          return;
        }
        
        this.news = news;
        this.loading = false;
        
        // Mettre à jour le titre de la page
        document.title = `${news.title} - Vibe-ticket`;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'actualité:', error);
        if (error.status === 404) {
          this.error = 'Cette actualité n\'existe pas ou n\'est plus disponible.';
        } else {
          this.error = 'Erreur lors du chargement de l\'actualité. Veuillez réessayer.';
        }
        this.loading = false;
      }
    });
  }

  /**
   * Retourne à la liste des actualités
   */
  goBack(): void {
    this.router.navigate(['/actualites']);
  }

  /**
   * Retourne le nom complet de l'auteur
   */
  getAuthorName(): string {
    if (!this.news) return '';

    // Gestion des différents formats de données (objet author vs propriétés séparées)
    if (this.news.author) {
      return `${this.news.author.firstName} ${this.news.author.lastName}`;
    } else if (this.news.authorFirstName && this.news.authorLastName) {
      return `${this.news.authorFirstName} ${this.news.authorLastName}`;
    } else if (this.news.authorName) {
      return this.news.authorName;
    } else {
      return 'Auteur inconnu';
    }
  }

  /**
   * Retourne la date formatée
   */
  getFormattedDate(): string {
    if (!this.news) return '';
    return this.newsService.formatDate(this.news.createdDate);
  }

  /**
   * Retourne le temps écoulé depuis la publication
   */
  getTimeAgo(): string {
    if (!this.news) return '';
    return this.newsService.getTimeAgo(this.news.createdDate);
  }

  /**
   * Vérifie si l'actualité a une image
   */
  hasImage(): boolean {
    return !!(this.news?.imageUrl && this.news.imageUrl.trim());
  }

  /**
   * Gère les erreurs de chargement d'image
   */
  onImageError(event: any): void {
    event.target.style.display = 'none';
  }

  /**
   * Partage l'actualité (fonctionnalité future)
   */
  shareNews(): void {
    if (navigator.share && this.news) {
      navigator.share({
        title: this.news.title,
        text: this.news.description.substring(0, 100) + '...',
        url: window.location.href
      }).catch(err => console.log('Erreur lors du partage:', err));
    } else {
      // Fallback: copier l'URL dans le presse-papiers
      navigator.clipboard.writeText(window.location.href).then(() => {
        // Ici on pourrait afficher un snackbar de confirmation
        console.log('URL copiée dans le presse-papiers');
      });
    }
  }
}
