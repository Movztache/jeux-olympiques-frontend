import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { News } from '../models/news.model';

/**
 * Intercepteur pour transformer les réponses des actualités du backend
 * Normalise les données selon le format attendu par le frontend
 */
@Injectable()
export class NewsTransformInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      map(event => {
        if (event instanceof HttpResponse && req.url.includes('/api/news')) {
          const transformedBody = this.transformNewsResponse(event.body);
          return event.clone({ body: transformedBody });
        }
        return event;
      })
    );
  }

  /**
   * Transforme la réponse des actualités pour normaliser les données
   */
  private transformNewsResponse(body: any): any {
    if (!body) return body;

    // Si c'est une réponse paginée
    if (body.content && Array.isArray(body.content)) {
      return {
        ...body,
        content: body.content.map((news: any) => this.transformSingleNews(news))
      };
    }

    // Si c'est un tableau d'actualités
    if (Array.isArray(body)) {
      return body.map((news: any) => this.transformSingleNews(news));
    }

    // Si c'est une seule actualité
    if (body.id) {
      return this.transformSingleNews(body);
    }

    return body;
  }

  /**
   * Transforme une actualité individuelle
   */
  private transformSingleNews(news: any): News {
    // Si l'objet author existe déjà, on le garde
    if (news.author && news.author.firstName) {
      return news;
    }

    // Sinon, on essaie de reconstruire l'objet author à partir des propriétés disponibles
    const transformedNews: News = {
      ...news
    };

    // Si on a des propriétés séparées pour l'auteur, on les utilise
    if (news.authorFirstName || news.authorLastName || news.authorEmail) {
      transformedNews.author = {
        id: news.authorId || 0,
        firstName: news.authorFirstName || '',
        lastName: news.authorLastName || '',
        email: news.authorEmail || ''
      };
    }

    return transformedNews;
  }
}
