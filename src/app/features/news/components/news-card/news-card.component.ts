import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { News } from '../../../../core/models/news.model';
import { NewsService } from '../../../../core/services/news.service';

/**
 * Composant carte pour afficher un aperçu d'une actualité
 */
@Component({
  selector: 'app-news-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './news-card.component.html',
  styleUrls: ['./news-card.component.scss']
})
export class NewsCardComponent {
  @Input() news!: News;
  @Input() showActions = false; // Pour afficher les actions admin
  @Input() compact = false; // Pour un affichage compact

  @Output() edit = new EventEmitter<News>();
  @Output() delete = new EventEmitter<News>();
  @Output() togglePublish = new EventEmitter<News>();

  constructor(
    private router: Router,
    private newsService: NewsService
  ) {}

  /**
   * Navigue vers le détail de l'actualité
   */
  viewDetail(): void {
    this.router.navigate(['/actualites', this.news.id]);
  }

  /**
   * Émet l'événement d'édition
   */
  onEdit(event: Event): void {
    event.stopPropagation();
    this.edit.emit(this.news);
  }

  /**
   * Émet l'événement de suppression
   */
  onDelete(event: Event): void {
    event.stopPropagation();
    this.delete.emit(this.news);
  }

  /**
   * Émet l'événement de basculement de publication
   */
  onTogglePublish(event: Event): void {
    event.stopPropagation();
    this.togglePublish.emit(this.news);
  }

  /**
   * Retourne le nom complet de l'auteur
   */
  getAuthorName(): string {
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
   * Retourne le temps écoulé depuis la publication
   */
  getTimeAgo(): string {
    return this.newsService.getTimeAgo(this.news.createdDate);
  }

  /**
   * Retourne une version tronquée de la description
   */
  getTruncatedDescription(maxLength: number = 150): string {
    if (this.news.description.length <= maxLength) {
      return this.news.description;
    }
    return this.news.description.substring(0, maxLength) + '...';
  }

  /**
   * Vérifie si l'actualité a une image
   */
  hasImage(): boolean {
    return !!(this.news.imageUrl && this.news.imageUrl.trim());
  }

  /**
   * Gère les erreurs de chargement d'image
   */
  onImageError(event: any): void {
    // Masquer l'image en cas d'erreur
    event.target.style.display = 'none';
  }
}
