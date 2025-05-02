// src/app/core/models/sales.model.ts

/**
 * Représente le résumé des statistiques de vente
 */
export interface SalesSummary {
  totalSales: number;
  totalRevenue: number;
  salesByOffer: Record<number, number>;
  revenueByOffer: Record<number, BigDecimal>;
}

/**
 * Représente les statistiques de vente par période
 */
export interface SalesStatisticsByPeriod {
  [offerId: number]: {
    salesCount: number;
    totalRevenue: BigDecimal;
    averageTicketPrice: BigDecimal;
  };
}

/**
 * Type pour le BigDecimal de Java
 */
export type BigDecimal = number;

/**
 * Représente les ventes par offre
 */
export interface SalesByOffer {
  [offerId: number]: number;
}

/**
 * Représente les revenus par offre
 */
export interface RevenuesByOffer {
  [offerId: number]: BigDecimal;
}

/**
 * Représente une offre avec ses statistiques de vente
 * Format adapté pour l'affichage dans les graphiques
 */
export interface OfferSalesData {
  offerId: number;
  offerName?: string;
  sales: number;
  revenue: BigDecimal;
}

