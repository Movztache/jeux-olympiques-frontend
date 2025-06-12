import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { News, NewsCreateRequest, NewsPageResponse, NewsSearchParams } from '../models/news.model';

/**
 * Service pour la gestion des actualités
 * Gère les appels API vers le backend Spring Boot
 */
@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private readonly apiUrl = `${environment.apiUrl}/news`;
  
  // Subject pour notifier les changements dans la liste des actualités
  private newsUpdatedSubject = new BehaviorSubject<boolean>(false);
  public newsUpdated$ = this.newsUpdatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Récupère toutes les actualités avec pagination (pour admin)
   */
  getAllNews(params: NewsSearchParams = {}): Observable<NewsPageResponse> {
    let httpParams = new HttpParams();
    
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortDir) httpParams = httpParams.set('sortDir', params.sortDir);

    return this.http.get<NewsPageResponse>(this.apiUrl, { params: httpParams });
  }

  /**
   * Récupère les actualités publiées avec pagination (pour public)
   */
  getPublishedNews(params: NewsSearchParams = {}): Observable<NewsPageResponse> {
    let httpParams = new HttpParams();

    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());

    return this.http.get<NewsPageResponse>(`${this.apiUrl}/published`, { params: httpParams }).pipe(
      tap(response => {
        console.log('Réponse du backend pour les actualités:', response);
        if (response.content && response.content.length > 0) {
          console.log('Première actualité:', response.content[0]);
        }
      })
    );
  }

  /**
   * Récupère une actualité par son ID
   */
  getNewsById(id: number): Observable<News> {
    return this.http.get<News>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crée une nouvelle actualité (Admin uniquement)
   */
  createNews(news: NewsCreateRequest, authorId: number): Observable<News> {
    const params = new HttpParams().set('authorId', authorId.toString());
    
    return this.http.post<News>(this.apiUrl, news, { params }).pipe(
      tap(() => this.notifyNewsUpdated())
    );
  }

  /**
   * Met à jour une actualité existante (Admin uniquement)
   */
  updateNews(id: number, news: NewsCreateRequest): Observable<News> {
    return this.http.put<News>(`${this.apiUrl}/${id}`, news).pipe(
      tap(() => this.notifyNewsUpdated())
    );
  }

  /**
   * Supprime une actualité (Admin uniquement)
   */
  deleteNews(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.notifyNewsUpdated())
    );
  }

  /**
   * Recherche d'actualités par titre
   */
  searchByTitle(title: string): Observable<News[]> {
    const params = new HttpParams().set('title', title);
    return this.http.get<News[]>(`${this.apiUrl}/search/title`, { params });
  }

  /**
   * Récupère les actualités d'un auteur spécifique
   */
  getNewsByAuthor(authorId: number): Observable<News[]> {
    return this.http.get<News[]>(`${this.apiUrl}/author/${authorId}`);
  }

  /**
   * Récupère les actualités dans une période donnée
   */
  getNewsByDateRange(startDate: string, endDate: string): Observable<News[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    
    return this.http.get<News[]>(`${this.apiUrl}/search/date`, { params });
  }

  /**
   * Calcule les statistiques des actualités (pour le dashboard admin)
   */
  getNewsStats(): Observable<any> {
    return this.getAllNews({ page: 0, size: 1000 }).pipe(
      map(response => {
        const totalNews = response.totalElements;
        const publishedNews = response.content.filter(news => news.published).length;
        const draftNews = totalNews - publishedNews;
        
        // Actualités récentes (derniers 7 jours)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentNews = response.content.filter(news => 
          new Date(news.createdDate) >= sevenDaysAgo
        ).length;

        return {
          totalNews,
          publishedNews,
          draftNews,
          recentNews
        };
      })
    );
  }

  /**
   * Notifie que les actualités ont été mises à jour
   */
  private notifyNewsUpdated(): void {
    this.newsUpdatedSubject.next(true);
  }

  /**
   * Formate une date pour l'affichage
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Calcule le temps écoulé depuis la publication
   */
  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      if (diffInHours === 0) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
      }
      return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    } else if (diffInDays === 1) {
      return 'Hier';
    } else if (diffInDays < 7) {
      return `Il y a ${diffInDays} jours`;
    } else {
      return this.formatDate(dateString);
    }
  }

  /**
   * Extrait le nom de l'auteur depuis un objet News (gère les différents formats DTO)
   */
  getAuthorName(news: News): string {
    if (news.author) {
      return `${news.author.firstName} ${news.author.lastName}`;
    } else if (news.authorFirstName && news.authorLastName) {
      return `${news.authorFirstName} ${news.authorLastName}`;
    } else if (news.authorName) {
      return news.authorName;
    } else {
      return 'Auteur inconnu';
    }
  }
}
