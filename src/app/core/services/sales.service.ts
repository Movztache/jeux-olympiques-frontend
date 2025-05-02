// src/app/core/services/sales.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  SalesSummary,
  SalesStatisticsByPeriod,
  OfferSalesData,
  SalesByOffer,
  RevenuesByOffer
} from '../models/sales.model';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private apiUrl = `${environment.apiUrl}/statistics`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère le nombre de ventes par offre
   */
  getSalesByOffer(): Observable<SalesByOffer> {
    return this.http.get<SalesByOffer>(`${this.apiUrl}/sales-by-offer`);
  }

  /**
   * Récupère le chiffre d'affaires par offre
   */
  getRevenusByOffer(): Observable<RevenuesByOffer> {
    return this.http.get<RevenuesByOffer>(`${this.apiUrl}/revenues-by-offer`);
  }

  /**
   * Récupère les statistiques de vente par période
   * @param start Date de début de la période
   * @param end Date de fin de la période
   */
  getSalesStatisticsByPeriod(start: Date, end: Date): Observable<SalesStatisticsByPeriod> {
    const startISO = start.toISOString();
    const endISO = end.toISOString();
    return this.http.get<SalesStatisticsByPeriod>(`${this.apiUrl}/by-period?start=${startISO}&end=${endISO}`);
  }

  /**
   * Obtient un résumé global des statistiques de vente
   */
  getStatisticsSummary(): Observable<SalesSummary> {
    return this.http.get<SalesSummary>(`${this.apiUrl}/summary`);
  }

  /**
   * Transforme les données brutes en un format plus adapté pour l'affichage
   */
  getFormattedSalesData(): Observable<OfferSalesData[]> {
    return this.getStatisticsSummary().pipe(
      map(summary => {
        const result: OfferSalesData[] = [];

        // Convertir l'objet en tableau pour faciliter l'affichage
        Object.keys(summary.salesByOffer).forEach(offerIdStr => {
          const offerId = parseInt(offerIdStr, 10);
          result.push({
            offerId,
            sales: summary.salesByOffer[offerId],
            revenue: summary.revenueByOffer[offerId] || 0
          });
        });

        return result;
      })
    );
  }
}
